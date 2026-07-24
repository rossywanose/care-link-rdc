# ================================
# Role Context Builder
# ================================


class RoleContextBuilder:
    """Construit le contexte selon le role de l'utilisateur"""

    def build_context(self, user, role):
        """Construit le contexte complet pour l'AI"""
        context = {
            "user_name": getattr(user, "first_name", None) or user.email.split("@")[0],
            "user_email": user.email,
            "role": role,
            "language": getattr(user, "preferred_language", "fr"),
        }

        if role == "citizen":
            context.update(self._citizen_context(user))
        elif role == "hospital":
            context.update(self._hospital_context(user))
        elif role == "authority":
            context.update(self._authority_context(user))

        return context

    def _citizen_context(self, user):
        """Contexte pour citoyen"""
        context = {}
        try:
            from births.models import BirthCertificate
            from deaths.models import DeathCertificate

            birth_certs = BirthCertificate.objects.filter(declarant=user).count()
            death_certs = DeathCertificate.objects.filter(declarant=user).count()
            context["birth_certificates_count"] = birth_certs
            context["death_certificates_count"] = death_certs
            context["total_certificates"] = birth_certs + death_certs
        except Exception:
            context["birth_certificates_count"] = 0
            context["death_certificates_count"] = 0
            context["total_certificates"] = 0
        return context

    def _hospital_context(self, user):
        """Contexte pour hopital"""
        context = {}
        try:
            from births.models import BirthCertificate
            from deaths.models import DeathCertificate
            from hospitals.models import Hospital

            hospital = Hospital.objects.filter(users=user).first()
            if hospital:
                context["hospital_name"] = hospital.name
                context["hospital_id"] = hospital.id
                birth_count = BirthCertificate.objects.filter(hospital=hospital).count()
                death_count = DeathCertificate.objects.filter(hospital=hospital).count()
                context["births_count"] = birth_count
                context["deaths_count"] = death_count
                context["total_records"] = birth_count + death_count
            else:
                context["hospital_name"] = "Non assigne"
                context["births_count"] = 0
                context["deaths_count"] = 0
        except Exception:
            context["hospital_name"] = "Non assigne"
            context["births_count"] = 0
            context["deaths_count"] = 0
        return context

    def _authority_context(self, user):
        """Contexte pour autorite"""
        context = {}
        try:
            from births.models import BirthCertificate
            from deaths.models import DeathCertificate
            from hospitals.models import Hospital

            total_births = BirthCertificate.objects.count()
            total_deaths = DeathCertificate.objects.count()
            total_hospitals = Hospital.objects.count()
            pending_validations = BirthCertificate.objects.filter(
                status="pending"
            ).count()

            context["total_births_national"] = total_births
            context["total_deaths_national"] = total_deaths
            context["total_hospitals"] = total_hospitals
            context["pending_validations"] = pending_validations
        except Exception:
            context["total_births_national"] = 0
            context["total_deaths_national"] = 0
            context["total_hospitals"] = 0
            context["pending_validations"] = 0
        return context

    def build_system_prompt(self, context):
        """Construit le prompt system pour Groq"""
        role = context.get("role", "citizen")
        user_name = context.get("user_name", "Utilisateur")

        base_prompt = f"""Tu es l'assistant AI de Care-Link RDC, une plateforme gouvernementale de gestion des actes de naissance et de deces en Republique Democratique du Congo, crée par l'Ir. Rossy Wansoe, le concepteur de l'App Care-Link_rdc.

REGLES STRICTES:
- Tu parles uniquement de sujets lies a Care-Link RDC (naissances, deces, certificats, validations, statistiques)
- Tu ne reponds JAMAIS a des questions hors sujet (politique, religion, divertissement, etc.)
- Si une question est hors sujet, reponds poliment que tu es specialise dans l'etat civil RDC
- Tu es chaleureux et professionnel
- Tu utilises le prenom de l'utilisateur: {user_name}
- Tu reponds en francais par defaut, sauf si l'utilisateur ecrit dans une autre langue

CONTEXTE UTILISATEUR:
- Role: {role}
- Nom: {user_name}
"""

        if role == "citizen":
            base_prompt += f"""
CONTEXTE CITOYEN:
- Certificats de naissance: {context.get('birth_certificates_count', 0)}
- Certificats de deces: {context.get('death_certificates_count', 0)}
- Total certificats: {context.get('total_certificates', 0)}

TU ES: L'assistant citoyen de Care-Link. Tu aides les citoyens a:
- Consulter leurs certificats
- Signaler des erreurs
- Comprendre les procedures
- Naviguer dans l'application
"""
        elif role == "hospital":
            base_prompt += f"""
CONTEXTE HOPITAL:
- Nom: {context.get('hospital_name', 'Non assigne')}
- Naissances enregistrees: {context.get('births_count', 0)}
- Deces enregistres: {context.get('deaths_count', 0)}
- Total actes: {context.get('total_records', 0)}

TU ES: L'assistant medical de Care-Link. Tu aides le personnel hospitalier a:
- Enregistrer les naissances et deces
- Generer les certificats
- Envoyer les rapports mensuels
- Comprendre les procedures de validation
"""
        elif role == "authority":
            base_prompt += f"""
CONTEXTE AUTORITE:
- Naissances nationales: {context.get('total_births_national', 0)}
- Deces nationaux: {context.get('total_deaths_national', 0)}
- Hopitaux actifs: {context.get('total_hospitals', 0)}
- Validations en attente: {context.get('pending_validations', 0)}

TU ES: L'assistant administratif de Care-Link. Tu aides les autorites a:
- Valider les certificats
- Auditer les hopitaux
- Consulter les statistiques nationales
- Gerer les signalements citoyens
"""

        return base_prompt


# Instance globale
role_context_builder = RoleContextBuilder()
