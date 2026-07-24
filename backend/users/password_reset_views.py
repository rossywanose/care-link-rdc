"""
Vues pour la réinitialisation de mot de passe.
Utilise le service d'emails HTML professionnel.
À placer dans : backend/users/password_reset_views.py
"""

from django.utils.crypto import get_random_string
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
import logging

from .models import AuditLog
from core.email_service import EmailService

logger = logging.getLogger(__name__)
User = get_user_model()


class PasswordResetRequestView(generics.GenericAPIView):
    """Demander une réinitialisation de mot de passe (envoi d'email avec code)."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"detail": "L'adresse email est requise."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Pour la sécurité, on ne révèle pas si l'email existe
            return Response(
                {
                    "detail": "Si cette adresse existe, un email de réinitialisation a été envoyé."
                },
                status=status.HTTP_200_OK,
            )

        # Générer un code à 6 chiffres
        reset_code = get_random_string(length=6, allowed_chars="0123456789")
        user.password_reset_code = reset_code
        user.password_reset_code_expires = timezone.now() + timedelta(minutes=30)
        user.save()

        # Envoyer l'email via le service HTML
        success = EmailService.send_password_reset(
            to_email=email,
            first_name=user.first_name or user.email.split("@")[0],
            reset_code=reset_code,
        )

        if not success and not settings.DEBUG:
            return Response(
                {"detail": "Erreur lors de l'envoi de l'email. Veuillez réessayer."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # En développement, retourner le code pour faciliter les tests
        if settings.DEBUG:
            return Response(
                {
                    "detail": "Si cette adresse existe, un email de réinitialisation a été envoyé.",
                    "code": reset_code,
                    "email": email,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": "Si cette adresse existe, un email de réinitialisation a été envoyé."
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetVerifyCodeView(generics.GenericAPIView):
    """Vérifier si le code est valide (sans changer le mot de passe)."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        code = request.data.get("code", "").strip()

        if not email or not code:
            return Response(
                {"detail": "Email et code sont requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Code invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not user.password_reset_code
            or user.password_reset_code != code
            or not user.password_reset_code_expires
            or user.password_reset_code_expires < timezone.now()
        ):
            return Response(
                {"detail": "Code invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Code valide.", "valid": True},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirmer la réinitialisation avec le code et le nouveau mot de passe."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        code = request.data.get("code", "").strip()
        new_password = request.data.get("new_password", "")

        if not email or not code or not new_password:
            return Response(
                {"detail": "Email, code et nouveau mot de passe sont requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 6:
            return Response(
                {"detail": "Le mot de passe doit contenir au moins 6 caractères."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Code invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vérifier le code
        if (
            not user.password_reset_code
            or user.password_reset_code != code
            or not user.password_reset_code_expires
            or user.password_reset_code_expires < timezone.now()
        ):
            return Response(
                {
                    "detail": "Code invalide ou expiré. Veuillez faire une nouvelle demande."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Réinitialiser le mot de passe
        user.set_password(new_password)
        user.password_reset_code = None
        user.password_reset_code_expires = None
        user.save()

        # Logger
        AuditLog.objects.create(
            user=user,
            action="update",
            target_type="user",
            target_id=str(user.id),
            details={"field": "password_reset"},
        )

        # Envoyer confirmation
        EmailService.send_notification(
            to_email=email,
            first_name=user.first_name or user.email.split("@")[0],
            title="Mot de passe modifié avec succès",
            message="Votre mot de passe a été réinitialisé avec succès. Si vous n'avez pas fait cette modification, contactez immédiatement notre support.",
        )

        return Response(
            {
                "detail": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."
            },
            status=status.HTTP_200_OK,
        )
