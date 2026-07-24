# ============================================
# Groq Client
# ============================================


import os
from groq import Groq


class GroqClient:
    """Client Groq pour l'assistant AI"""

    def __init__(self):
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )
        # Modèle par défaut - rapide et efficace
        self.model = "llama-3.3-70b-versatile"

    def chat(self, messages, temperature=0.7, max_tokens=2048):
        """
        Envoyer une conversation à Groq

        Args:
            messages: Liste de dicts {role, content}
            temperature: Créativité (0-2)
            max_tokens: Longueur max de réponse

        Returns:
            dict: {content, tokens_used, model}
        """
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
        """Version streaming pour le frontend"""
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


# Instance singleton
groq_client = GroqClient()
