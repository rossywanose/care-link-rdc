# ============================================
# Groq Client - Version robuste pour Render
# ============================================

import os
from groq import Groq


class GroqClient:
    """Client Groq pour l'assistant AI"""

    def __init__(self):
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            self.client = None
            print("⚠️ GROQ_API_KEY non définie - l'IA sera désactivée")
        else:
            self.client = Groq(api_key=api_key)

        self.model = "llama-3.3-70b-versatile"

    def is_ready(self):
        """Vérifie si le client est configuré"""
        return self.client is not None

    def chat(self, messages, temperature=0.7, max_tokens=2048):
        if not self.is_ready():
            return {
                "content": "Le service IA n'est pas configuré. Veuillez définir GROQ_API_KEY.",
                "error": "GROQ_API_KEY manquante",
                "success": False,
            }

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            return {
                "content": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
                "model": self.model,
                "success": True,
            }
        except Exception as e:
            return {"content": "", "error": str(e), "success": False}

    def chat_with_streaming(self, messages, temperature=0.7, max_tokens=2048):
        if not self.is_ready():
            yield "Le service IA n'est pas configuré. Veuillez définir GROQ_API_KEY."
            return

        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"[ERREUR: {str(e)}]"


# Instance singleton - initialisée paresseusement au premier appel
_groq_instance = None


def get_groq_client():
    global _groq_instance
    if _groq_instance is None:
        _groq_instance = GroqClient()
    return _groq_instance


# ✅ COMPATIBILITÉ : views.py peut toujours importer groq_client
groq_client = get_groq_client()
