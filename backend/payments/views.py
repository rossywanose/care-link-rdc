# ==========================================
# VIEWS PAYMENTS (CORRIGÉ — Frais d'ouverture $1)
# ==========================================

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
import uuid
from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentVerifySerializer,
    PaymentHistorySerializer,
)


class PaymentListView(generics.ListAPIView):
    """Liste des paiements (admin/authority uniquement)"""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_authority:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)


class PaymentDetailView(generics.RetrieveAPIView):
    """Détail d'un paiement"""

    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_opening_fee(request):
    """
    Créer un paiement de frais d'ouverture ($1).
    Accessible uniquement aux hôpitaux en attente de paiement.
    """
    user = request.user

    # ✅ DEBUG
    print(f"📥 [create_opening_fee] Requête reçue: {request.data}")
    print(
        f"👤 Utilisateur: {user.email}, rôle: {user.role}, is_hospital: {getattr(user, 'is_hospital', False)}"
    )
    print(f"🏥 Hôpital: {getattr(user, 'hospital', None)}")

    # Vérifier que l'utilisateur est un hôpital
    if not getattr(user, "is_hospital", False) or not getattr(user, "hospital", None):
        return Response(
            {"detail": "Seuls les comptes hôpital peuvent effectuer ce paiement."},
            status=status.HTTP_403_FORBIDDEN,
        )

    hospital = user.hospital

    # Vérifier que l'hôpital n'est pas déjà payé
    if hospital.opening_fee_paid:
        return Response(
            {
                "detail": "Les frais d'ouverture ont déjà été payés.",
                "official_license": hospital.official_license,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Valider les données
    serializer = PaymentCreateSerializer(data=request.data)

    # ✅ DEBUG : Afficher les erreurs de validation
    if not serializer.is_valid():
        print(f"❌ [create_opening_fee] Erreurs de validation: {serializer.errors}")
        return Response(
            {"detail": "Données invalides.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Créer le paiement
    payment = Payment.objects.create(
        user=user,
        hospital=hospital,
        amount=1.00,
        currency="USD",
        method=serializer.validated_data["method"],
        phone_number=serializer.validated_data.get("phone_number", ""),
        description="Frais d'ouverture de compte hôpital Care-Link RDC",
        status="pending",
    )

    # TODO: En production, intégrer l'API Airtel Money ou Stripe ici
    # Pour le développement, on simule le traitement

    return Response(
        {
            "id": str(payment.id),
            "payment_id": payment.payment_id,
            "amount": str(payment.amount),
            "currency": payment.currency,
            "method": payment.method,
            "status": payment.status,
            "message": "Paiement initié. Veuillez confirmer la transaction.",
            "next_step": "Utilisez l'endpoint /verify/ pour confirmer le paiement.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def verify_payment(request, payment_id):
    """
    Vérifier et confirmer un paiement.
    En production : webhook Stripe ou callback API Airtel.
    """
    user = request.user

    try:
        payment = Payment.objects.get(id=payment_id, user=user)
    except Payment.DoesNotExist:
        return Response(
            {"detail": "Paiement non trouvé."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Vérifier que le paiement est en attente
    if payment.status != "pending":
        return Response(
            {
                "detail": f"Ce paiement est déjà {payment.get_status_display()}.",
                "status": payment.status,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # TODO: En production, vérifier le statut réel avec Stripe ou Airtel API
    # Pour le développement, on simule un succès
    simulate_success = request.data.get("simulate_success", True)

    if simulate_success:
        # Marquer comme réussi
        payment.mark_success()

        # Activer l'hôpital
        hospital = payment.hospital
        if hospital and not hospital.opening_fee_paid:
            official_license = hospital.activate_after_payment()

            return Response(
                {
                    "detail": "Paiement confirmé avec succès.",
                    "status": "success",
                    "payment_id": payment.payment_id,
                    "amount_paid": str(payment.amount),
                    "paid_at": payment.paid_at,
                    "official_license": official_license,
                    "hospital_status": hospital.status,
                    "message": "Votre hôpital est maintenant activé. Vous pouvez accéder au tableau de bord.",
                },
                status=status.HTTP_200_OK,
            )

    else:
        payment.mark_failed("Paiement refusé par le processeur.")

        return Response(
            {
                "detail": "Le paiement a échoué.",
                "status": "failed",
                "payment_id": payment.payment_id,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_payment_history(request):
    """Historique des paiements de l'utilisateur connecté"""

    payments = Payment.objects.filter(user=request.user)
    serializer = PaymentHistorySerializer(payments, many=True)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_payment_status(request, payment_id):
    """Statut d'un paiement spécifique"""

    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
    except Payment.DoesNotExist:
        return Response(
            {"detail": "Paiement non trouvé."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "id": str(payment.id),
            "payment_id": payment.payment_id,
            "status": payment.status,
            "status_display": payment.get_status_display(),
            "amount": str(payment.amount),
            "method": payment.get_method_display(),
            "created_at": payment.created_at,
            "paid_at": payment.paid_at,
        }
    )
