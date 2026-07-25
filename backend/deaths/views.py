# =====================================================
# VIEWS DECES (DEATH)
# =====================================================

import qrcode
import qrcode.image.svg
from io import BytesIO
from django.http import HttpResponse
from django.conf import settings
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from .models import DeathCertificate
from .serializers import (
    DeathCertificateSerializer,
    DeathCertificateCreateSerializer,  # ← AJOUTÉ
    DeathCertificateListSerializer,
)
from users.permissions import IsHospital, IsAuthorityOrAdmin
from certificates.certificate_generator import generate_death_certificate


class DeathListView(generics.ListAPIView):
    """List death certificates."""

    serializer_class = DeathCertificateListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "gender", "hospital", "date_of_death"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return DeathCertificate.objects.none()

        user = self.request.user
        if not user.is_authenticated:
            return DeathCertificate.objects.none()

        if user.is_authority or user.is_admin:
            return DeathCertificate.objects.all()
        elif user.is_hospital:
            return DeathCertificate.objects.filter(hospital=user.hospital)
        return DeathCertificate.objects.none()


class DeathDetailView(generics.RetrieveAPIView):
    """Get death certificate details."""

    queryset = DeathCertificate.objects.all()
    serializer_class = DeathCertificateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"


class DeathCreateView(generics.CreateAPIView):
    """Create a new death certificate."""

    queryset = DeathCertificate.objects.all()
    serializer_class = DeathCertificateCreateSerializer  # ← CORRIGÉ
    permission_classes = [IsHospital]

    def perform_create(self, serializer):
        import datetime

        year = datetime.datetime.now().year
        count = DeathCertificate.objects.filter(created_at__year=year).count() + 1
        cert_id = f"DEC-{year}-{count:04d}"

        serializer.save(
            certificate_id=cert_id,
            declared_by=self.request.user,
            hospital=self.request.user.hospital,
            status="pending",
        )


class DeathUpdateView(generics.UpdateAPIView):
    """Update death certificate."""

    queryset = DeathCertificate.objects.all()
    serializer_class = DeathCertificateSerializer
    permission_classes = [IsHospital]
    lookup_field = "pk"


class DeathValidateView(generics.GenericAPIView):
    """Validate or reject a death certificate (authority only)."""

    permission_classes = [IsAuthorityOrAdmin]

    def post(self, request, pk):
        certificate = DeathCertificate.objects.get(pk=pk)
        action = request.data.get("action")

        if action == "approve":
            certificate.status = "approved"
            certificate.validated_by = request.user
            certificate.validation_date = timezone.now()
            certificate.save()
            return Response({"detail": "Certificat de décès validé avec succès."})

        elif action == "reject":
            certificate.status = "rejected"
            certificate.rejection_reason = request.data.get("reason", "")
            certificate.validated_by = request.user
            certificate.save()
            return Response({"detail": "Certificat de décès rejeté."})

        return Response(
            {"detail": "Action invalide."}, status=status.HTTP_400_BAD_REQUEST
        )


class DeathStatsView(generics.GenericAPIView):
    """Get death statistics."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        from django.db.models.functions import TruncMonth

        user = request.user

        # ✅ Filtrer par hôpital si l'utilisateur est un hôpital
        if user.is_hospital and user.hospital:
            base_queryset = DeathCertificate.objects.filter(hospital=user.hospital)
        elif user.is_authority or user.is_admin:
            base_queryset = DeathCertificate.objects.all()
        else:
            base_queryset = DeathCertificate.objects.filter(declared_by=user)

        total = base_queryset.count()
        pending = base_queryset.filter(status="pending").count()
        approved = base_queryset.filter(status="approved").count()
        rejected = base_queryset.filter(status="rejected").count()

        monthly = (
            base_queryset.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        by_cause = base_queryset.values("cause_category").annotate(count=Count("id"))

        return Response(
            {
                "total": total,
                "pending": pending,
                "approved": approved,
                "rejected": rejected,
                "monthly": list(monthly),
                "by_cause": list(by_cause),
            }
        )


# ← AJOUTÉ: Vue pour télécharger le certificat PDF
class DeathCertificatePDFView(generics.GenericAPIView):
    """Télécharger le certificat de décès en PDF."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = get_object_or_404(DeathCertificate, certificate_id=certificate_id)

        # Vérifier que le certificat est validé
        if certificate.status not in ["approved", "paid"]:
            return Response(
                {"detail": "Le certificat n'est pas encore validé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Vérifier les permissions
        user = request.user
        if not (
            user.is_admin
            or user.is_authority
            or (user.is_hospital and certificate.hospital == user.hospital)
            or certificate.declared_by == user
        ):
            return Response(
                {
                    "detail": "Vous n'avez pas la permission de télécharger ce certificat."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Générer le PDF
        pdf_buffer = generate_death_certificate(certificate)

        filename = f"Attestation_Deces_{certificate.certificate_id}.pdf"

        response = FileResponse(
            pdf_buffer,
            content_type="application/pdf",
            as_attachment=True,
            filename=filename,
        )

        return response


class DeathQRCodeView(generics.GenericAPIView):
    """Générer le QR code du certificat de décès."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = get_object_or_404(DeathCertificate, certificate_id=certificate_id)

        # Vérifier que le certificat est validé
        if certificate.status not in ["approved", "paid"]:
            return Response(
                {"detail": "Le certificat n'est pas encore validé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # URL de vérification
        verify_url = f"https://carelink-rdc.cd/verify/{certificate.certificate_id}"

        # Générer le QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(verify_url)
        qr.make(fit=True)

        # Générer l'image PNG
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type="image/png")
        response["Content-Disposition"] = (
            f'inline; filename="qr_{certificate.certificate_id}.png"'
        )
        return response


class DeathCertificatePreviewView(generics.GenericAPIView):
    """Aperçu du certificat de décès en PDF (inline, pas téléchargement)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = get_object_or_404(DeathCertificate, certificate_id=certificate_id)

        # Vérifier que le certificat est validé
        if certificate.status not in ["approved", "paid"]:
            return Response(
                {"detail": "Le certificat n'est pas encore validé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Vérifier les permissions
        user = request.user
        if not (
            user.is_admin
            or user.is_authority
            or (user.is_hospital and certificate.hospital == user.hospital)
            or certificate.declared_by == user
        ):
            return Response(
                {"detail": "Vous n'avez pas la permission de voir ce certificat."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Générer le PDF
        pdf_buffer = generate_death_certificate(certificate)

        response = HttpResponse(pdf_buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="preview_{certificate.certificate_id}.pdf"'
        )
        return response
