# ===========================================
# Views Hôpitals (CORRIGÉ — sans check abonnement)
# ===========================================

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Hospital
from .serializers import (
    HospitalSerializer,
    HospitalListSerializer,
    HospitalUpdateSerializer,
)
from users.permissions import IsAuthorityOrAdmin, IsHospital


class HospitalListView(generics.ListAPIView):
    """List all hospitals."""

    queryset = Hospital.objects.all()
    serializer_class = HospitalListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["province", "commune", "hospital_type", "status"]

    def get_queryset(self):
        queryset = Hospital.objects.all()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class HospitalDetailView(generics.RetrieveAPIView):
    """Get hospital details."""

    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"


class HospitalCreateView(generics.CreateAPIView):
    """Create a new hospital (authority only)."""

    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthorityOrAdmin]


class HospitalUpdateView(generics.UpdateAPIView):
    """Update hospital info (authority or hospital staff)."""

    queryset = Hospital.objects.all()
    serializer_class = HospitalUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def get_permissions(self):
        if self.request.user.role == "hospital" and self.request.user.hospital:
            return [permissions.IsAuthenticated()]
        return [IsAuthorityOrAdmin()]


class HospitalStatsView(generics.GenericAPIView):
    """Get hospital statistics."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from django.shortcuts import get_object_or_404

        hospital = get_object_or_404(Hospital, pk=pk)

        # Vérifier les permissions
        user = request.user
        if user.is_hospital and user.hospital != hospital:
            return Response(
                {
                    "detail": "Vous ne pouvez voir que les stats de votre propre hôpital."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        elif not (user.is_hospital or user.is_authority or user.is_admin):
            return Response(
                {"detail": "Permission refusée."}, status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {
                "total_births": hospital.total_births,
                "total_deaths": hospital.total_deaths,
                "total_certificates": hospital.total_certificates,
                "validation_rate": hospital.validation_rate,
                "capacity": hospital.capacity,
                "staff_count": hospital.staff_count,
            }
        )


# ✅ NOUVEAU : Activer l'hôpital après paiement $1
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def activate_hospital_payment(request):
    """Activer l'hôpital après paiement des frais d'ouverture ($1)."""
    user = request.user

    if not user.is_hospital or not user.hospital:
        return Response(
            {"detail": "Utilisateur non associé à un hôpital."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    hospital = user.hospital

    # Vérifier si déjà payé
    if hospital.opening_fee_paid:
        return Response(
            {
                "detail": "Les frais d'ouverture ont déjà été payés.",
                "official_license": hospital.official_license,
                "status": hospital.status,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Activer l'hôpital et générer la licence
    official_license = hospital.activate_after_payment()

    # Envoyer email avec la licence (optionnel, si configuré)
    # from django.core.mail import send_mail
    # send_mail(
    #     'Votre licence officielle Care-Link RDC',
    #     f'Félicitations ! Votre hôpital est maintenant activé.\nLicence: {official_license}',
    #     'noreply@carelink-rdc.com',
    #     [hospital.email],
    #     fail_silently=True,
    # )

    return Response(
        {
            "detail": "Hôpital activé avec succès.",
            "official_license": official_license,
            "status": hospital.status,
            "opening_fee_paid": hospital.opening_fee_paid,
            "opening_fee_paid_at": hospital.opening_fee_paid_at,
        },
        status=status.HTTP_200_OK,
    )


# ✅ NOUVEAU : Vérifier le statut de paiement de l'hôpital
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def check_hospital_status(request):
    """Vérifier le statut de l'hôpital (pending/active)."""
    user = request.user

    if not user.is_hospital or not user.hospital:
        return Response(
            {"detail": "Utilisateur non associé à un hôpital."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    hospital = user.hospital

    return Response(
        {
            "status": hospital.status,
            "opening_fee_paid": hospital.opening_fee_paid,
            "opening_fee_paid_at": hospital.opening_fee_paid_at,
            "official_license": hospital.official_license,
            "can_access_dashboard": hospital.status == "active",
        }
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_hospital_logo(request, pk):
    """Upload hospital logo separately."""
    try:
        hospital = Hospital.objects.get(pk=pk)
        # Check permission
        if request.user.role == "hospital" and request.user.hospital != hospital:
            return Response(
                {"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN
            )

        logo_file = request.FILES.get("logo")
        if not logo_file:
            return Response(
                {"detail": "No logo file provided."}, status=status.HTTP_400_BAD_REQUEST
            )

        hospital.logo = logo_file
        hospital.save()

        return Response(
            {
                "detail": "Logo uploaded successfully.",
                "logo_url": (
                    request.build_absolute_uri(hospital.logo.url)
                    if hospital.logo
                    else None
                ),
            }
        )
    except Hospital.DoesNotExist:
        return Response(
            {"detail": "Hospital not found."}, status=status.HTTP_404_NOT_FOUND
        )
