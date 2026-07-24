# ================================================
# Views Reports (CORRIGÉ — avec mentioned_hospital)
# ================================================

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Report, CitizenReport
from .serializers import ReportSerializer, ReportListSerializer, CitizenReportSerializer
from users.permissions import IsHospital, IsAuthorityOrAdmin


class ReportListView(generics.ListAPIView):
    """List reports."""

    serializer_class = ReportListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "report_type", "hospital"]

    def get_queryset(self):
        user = self.request.user
        if user.is_authority or user.is_admin:
            return Report.objects.all()
        elif user.is_hospital:
            return Report.objects.filter(hospital=user.hospital)
        return Report.objects.none()


class ReportDetailView(generics.RetrieveAPIView):
    """Get report details."""

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReportCreateView(generics.CreateAPIView):
    """Create a new report (hospital only)."""

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsHospital]

    def create(self, request, *args, **kwargs):
        user = request.user
        hospital = user.hospital

        print(f"📥 [ReportCreate] Données reçues: {request.data}")
        print(f"👤 User: {user.email}, Hospital: {hospital}")

        if not hospital:
            return Response(
                {"detail": "Aucun hôpital associé à cet utilisateur."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vérifier si un rapport pour ce mois existe déjà
        current_month_start = timezone.now().replace(day=1)
        existing_report = Report.objects.filter(
            hospital=hospital,
            created_at__year=current_month_start.year,
            created_at__month=current_month_start.month,
        ).first()

        if existing_report:
            return Response(
                {
                    "detail": f"Un rapport pour {current_month_start.strftime('%B %Y')} existe déjà.",
                    "code": "REPORT_EXISTS",
                    "report_id": existing_report.report_id,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Créer le rapport
        import datetime

        count = (
            Report.objects.filter(created_at__year=datetime.datetime.now().year).count()
            + 1
        )
        report_id = f"RPT-{datetime.datetime.now().year}-{count:04d}"

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print(f"❌ [ReportCreate] Erreurs: {serializer.errors}")
            return Response(
                {"detail": "Données invalides.", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ CORRIGÉ : Utiliser serializer.save() avec les champs obligatoires
        serializer.save(
            report_id=report_id,
            submitted_by=user,
            hospital=hospital,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReportUpdateView(generics.UpdateAPIView):
    """Update report."""

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsHospital]


class ReportSubmitView(generics.GenericAPIView):
    """Submit a report."""

    permission_classes = [IsHospital]

    def post(self, request, pk):
        report = Report.objects.get(pk=pk)
        report.status = "submitted"
        report.submitted_at = timezone.now()
        report.save()
        return Response({"detail": "Rapport soumis avec succes."})


class ReportReviewView(generics.GenericAPIView):
    """Review a report (authority only)."""

    permission_classes = [IsAuthorityOrAdmin]

    def post(self, request, pk):
        report = Report.objects.get(pk=pk)
        action = request.data.get("action")

        if action == "approve":
            report.status = "approved"
        elif action == "reject":
            report.status = "rejected"
        elif action == "review":
            report.status = "reviewed"
        else:
            return Response(
                {"detail": "Action invalide."}, status=status.HTTP_400_BAD_REQUEST
            )

        report.reviewed_by = request.user
        report.reviewed_at = timezone.now()
        report.review_notes = request.data.get("notes", "")
        report.save()
        return Response({"detail": f"Rapport {action} avec succes."})


# =====================================================
# Citizen Reports (Signalements)
# =====================================================


class CitizenReportListView(generics.ListAPIView):
    """List citizen reports."""

    serializer_class = CitizenReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authority or user.is_admin:
            return CitizenReport.objects.all()
        return CitizenReport.objects.filter(submitted_by=user)


class CitizenReportCreateView(generics.CreateAPIView):
    """Create a new citizen report."""

    queryset = CitizenReport.objects.all()
    serializer_class = CitizenReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        import datetime

        count = (
            CitizenReport.objects.filter(
                created_at__year=datetime.datetime.now().year
            ).count()
            + 1
        )
        report_id = f"SIG-{datetime.datetime.now().year}-{count:04d}"

        # ✅ NOUVEAU : Récupérer l'hôpital mentionné si fourni
        hospital_id = self.request.data.get("hospital_id")
        mentioned_hospital = None
        if hospital_id:
            from hospitals.models import Hospital

            try:
                mentioned_hospital = Hospital.objects.get(id=hospital_id)
            except Hospital.DoesNotExist:
                mentioned_hospital = None

        serializer.save(
            report_id=report_id,
            submitted_by=self.request.user,
            mentioned_hospital=mentioned_hospital,
        )


class CitizenReportDetailView(generics.RetrieveAPIView):
    """Get citizen report details."""

    queryset = CitizenReport.objects.all()
    serializer_class = CitizenReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class CitizenReportReviewView(generics.GenericAPIView):
    """Review a citizen report (authority only)."""

    permission_classes = [IsAuthorityOrAdmin]

    def post(self, request, pk):
        report = CitizenReport.objects.get(pk=pk)
        action = request.data.get("action")

        if action == "resolve":
            report.status = "resolved"
        elif action == "reject":
            report.status = "rejected"
        elif action == "review":
            report.status = "reviewed"
        else:
            return Response(
                {"detail": "Action invalide."}, status=status.HTTP_400_BAD_REQUEST
            )

        report.reviewed_by = request.user
        report.reviewed_at = timezone.now()
        report.review_notes = request.data.get("notes", "")
        report.save()
        return Response({"detail": f"Signalement {action} avec succes."})
