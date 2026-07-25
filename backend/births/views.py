# =====================================================
# VIEWS NAISSANCE (BIRTH)
# =====================================================

import qrcode
import qrcode.image.svg
from io import BytesIO
from django.http import HttpResponse
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BirthCertificate
from .serializers import (
    BirthCertificateSerializer,
    BirthCertificateCreateSerializer,
    BirthCertificateListSerializer,
)
from users.permissions import IsHospital, IsAuthorityOrAdmin
from django.db.models import Q
from django.utils import timezone
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from certificates.certificate_generator import generate_birth_certificate


class BirthListView(generics.ListAPIView):
    """List birth certificates."""

    serializer_class = BirthCertificateListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "gender", "hospital", "date_of_birth"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return BirthCertificate.objects.none()

        user = self.request.user
        if not user.is_authenticated:
            return BirthCertificate.objects.none()

        if user.is_authority or user.is_admin:
            return BirthCertificate.objects.all()
        elif user.is_hospital:
            return BirthCertificate.objects.filter(hospital=user.hospital)
        else:
            return BirthCertificate.objects.filter(declared_by=user)


class BirthDetailView(generics.RetrieveAPIView):
    """Get birth certificate details."""

    queryset = BirthCertificate.objects.all()
    serializer_class = BirthCertificateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"


class BirthCreateView(generics.CreateAPIView):
    """Create a new birth certificate."""

    queryset = BirthCertificate.objects.all()
    serializer_class = BirthCertificateCreateSerializer
    permission_classes = [IsHospital]

    def perform_create(self, serializer):
        import datetime

        year = datetime.datetime.now().year
        count = BirthCertificate.objects.filter(created_at__year=year).count() + 1
        cert_id = f"CERT-{year}-{count:04d}"

        serializer.save(
            certificate_id=cert_id,
            declared_by=self.request.user,
            hospital=self.request.user.hospital,
            status="pending",
        )


class BirthUpdateView(generics.UpdateAPIView):
    """Update birth certificate."""

    queryset = BirthCertificate.objects.all()
    serializer_class = BirthCertificateSerializer
    permission_classes = [IsHospital]
    lookup_field = "pk"


class BirthValidateView(generics.GenericAPIView):
    """Validate or reject a birth certificate (authority only)."""

    permission_classes = [IsAuthorityOrAdmin]

    def post(self, request, pk):
        certificate = BirthCertificate.objects.get(pk=pk)
        action = request.data.get("action")

        if action == "approve":
            certificate.status = "approved"
            certificate.validated_by = request.user
            certificate.validation_date = timezone.now()
            certificate.save()
            return Response({"detail": "Certificat valide avec succes."})

        elif action == "reject":
            certificate.status = "rejected"
            certificate.rejection_reason = request.data.get("reason", "")
            certificate.validated_by = request.user
            certificate.save()
            return Response({"detail": "Certificat rejete."})

        return Response(
            {"detail": "Action invalide."}, status=status.HTTP_400_BAD_REQUEST
        )


class BirthStatsView(generics.GenericAPIView):
    """Get birth statistics."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        from django.db.models.functions import TruncMonth

        user = request.user

        # ✅ Filtrer par hôpital si l'utilisateur est un hôpital
        if user.is_hospital and user.hospital:
            base_queryset = BirthCertificate.objects.filter(hospital=user.hospital)
        elif user.is_authority or user.is_admin:
            base_queryset = BirthCertificate.objects.all()
        else:
            base_queryset = BirthCertificate.objects.filter(declared_by=user)

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

        gender_stats = base_queryset.values("gender").annotate(count=Count("id"))

        return Response(
            {
                "total": total,
                "pending": pending,
                "approved": approved,
                "rejected": rejected,
                "monthly": list(monthly),
                "by_gender": list(gender_stats),
            }
        )


class BirthCertificatePDFView(generics.GenericAPIView):
    """Télécharger le certificat de naissance en PDF."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = get_object_or_404(BirthCertificate, certificate_id=certificate_id)

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
        pdf_buffer = generate_birth_certificate(certificate)

        filename = f"Attestation_Naissance_{certificate.certificate_id}.pdf"

        response = FileResponse(
            pdf_buffer,
            content_type="application/pdf",
            as_attachment=True,
            filename=filename,
        )

        return response


class BirthQRCodeView(generics.GenericAPIView):
    """Générer le QR code du certificat de naissance."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = get_object_or_404(BirthCertificate, certificate_id=certificate_id)

        if certificate.status not in ["approved", "paid"]:
            return Response(
                {"detail": "Le certificat n'est pas encore validé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        verify_url = f"https://carelink-rdc.cd/verify/{certificate.certificate_id}"

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(verify_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type="image/png")
        response["Content-Disposition"] = (
            f'inline; filename="qr_{certificate.certificate_id}.png"'
        )
        return response


class BirthCertificatePreviewView(generics.GenericAPIView):
    """Aperçu du certificat de naissance en PDF (inline)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = get_object_or_404(BirthCertificate, certificate_id=certificate_id)

        if certificate.status not in ["approved", "paid"]:
            return Response(
                {"detail": "Le certificat n'est pas encore validé."},
                status=status.HTTP_403_FORBIDDEN,
            )

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

        pdf_buffer = generate_birth_certificate(certificate)

        response = HttpResponse(pdf_buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="preview_{certificate.certificate_id}.pdf"'
        )
        return response
