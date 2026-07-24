# =====================================
# Rag Engine - CORRIGE
# =====================================

from django.db.models import Q
from ..models import FAQ


class RAGEngine:
    """
    Moteur RAG (Retrieval-Augmented Generation)
    Recherche les suggestions predéfinies avant d'appeler Groq
    """

    def __init__(self):
        self.similarity_threshold = 0.6  # Seuil de correspondance

    def search_faq(self, query, role="all", limit=3):
        """
        Rechercher une FAQ correspondant a la question
        """
        query_lower = query.lower().strip()
        query_words = set(query_lower.split())

        # Filtrer par role
        if role and role != "all":
            faqs = FAQ.objects.filter(Q(role=role) | Q(role="all"), is_active=True)
        else:
            faqs = FAQ.objects.filter(is_active=True)

        # Scorer chaque FAQ
        scored_faqs = []
        for faq in faqs:
            score = self._calculate_score(query_lower, query_words, faq)
            if score > 0:
                scored_faqs.append((score, faq))

        # Trier par score decroissant
        scored_faqs.sort(key=lambda x: x[0], reverse=True)

        return [faq for score, faq in scored_faqs[:limit]]

    def _calculate_score(self, query_lower, query_words, faq):
        """Calculer le score de correspondance - VERSION STRICTE"""
        score = 0
        faq_question_lower = faq.question.lower()
        faq_keywords = set(faq.keywords) if faq.keywords else set()
        faq_question_words = set(faq_question_lower.split())

        # 1. CORRESPONDANCE EXACTE (score max)
        if query_lower == faq_question_lower:
            score += 100  # Match parfait
        elif query_lower in faq_question_lower or faq_question_lower in query_lower:
            score += 50  # Contient la question

        # 2. Mots communs entre la question et la FAQ
        common_words = query_words & faq_question_words
        # Ne compter que les mots significatifs (plus de 3 lettres)
        significant_common = [w for w in common_words if len(w) > 3]
        score += len(significant_common) * 3

        # 3. Mots-cles correspondants (plus important)
        common_keywords = query_words & faq_keywords
        score += len(common_keywords) * 8

        # 4. Penalite si peu de mots en commun
        if len(common_words) < 2 and len(common_keywords) == 0:
            score = max(0, score - 10)  # Penalite forte

        # 5. Bonus priorite (faible)
        score += faq.priority * 0.5

        return score

    def get_best_answer(self, query, role="all"):
        """
        Obtenir la meilleure reponse predefinie

        Returns:
            dict: {found: bool, answer: str, faq: FAQ} ou {found: False}
        """
        results = self.search_faq(query, role, limit=1)

        if results:
            best_match = results[0]
            score = self._calculate_score(
                query.lower(), set(query.lower().split()), best_match
            )

            # SEUIL STRICT : minimum 15 pour une FAQ
            # - 0-5 : aucune correspondance -> Groq
            # - 5-15 : correspondance faible -> Groq
            # - 15+ : correspondance acceptable -> FAQ
            if score >= 15:
                return {
                    "found": True,
                    "answer": best_match.answer,
                    "faq": best_match,
                    "score": score,
                }

        return {"found": False}


# Instance singleton
rag_engine = RAGEngine()
