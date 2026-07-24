# ===============================================
# Models Ai-Assistant
# ===============================================

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FAQ(models.Model):
    """Questions/Réponses prédéfinies par rôle"""

    ROLE_CHOICES = [
        ("citizen", "Citoyen"),
        ("hospital", "Hôpital"),
        ("authority", "Autorité"),
        ("all", "Tous les rôles"),
    ]

    question = models.TextField(help_text="Question ou mot-clés")
    answer = models.TextField(help_text="Réponse prédéfinie")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="all")
    category = models.CharField(
        max_length=100,
        blank=True,
        help_text="Catégorie: naissance, deces, certificat, paiement, etc.",
    )
    keywords = models.JSONField(default=list, help_text="Mots-clés pour la recherche")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Priorité de correspondance")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"
        ordering = ["-priority", "created_at"]

    def __str__(self):
        return f"[{self.role}] {self.question[:50]}..."


class Conversation(models.Model):
    """Conversation entre utilisateur et AI"""

    ROLE_CHOICES = [
        ("citizen", "Citoyen"),
        ("hospital", "Hôpital"),
        ("authority", "Autorité"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="ai_conversations"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    title = models.CharField(
        max_length=255, blank=True, help_text="Titre auto-généré de la conversation"
    )
    context_data = models.JSONField(
        default=dict, help_text="Données contextuelles: nom, hôpital, stats, etc."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation {self.id} - {self.user.email} ({self.role})"


class Message(models.Model):
    """Message individuel dans une conversation"""

    SENDER_CHOICES = [
        ("user", "Utilisateur"),
        ("ai", "Assistant"),
    ]

    SOURCE_CHOICES = [
        ("faq", "Suggestion prédéfinie"),
        ("groq", "Groq Claude API"),
        ("hybrid", "Mixte"),
    ]

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    source = models.CharField(
        max_length=20, choices=SOURCE_CHOICES, blank=True, null=True
    )
    faq_reference = models.ForeignKey(
        FAQ, on_delete=models.SET_NULL, null=True, blank=True
    )
    metadata = models.JSONField(
        default=dict, help_text="Temps de réponse, tokens, etc."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender}: {self.content[:50]}..."
