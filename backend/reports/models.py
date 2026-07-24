# =========================================================
# Models Reports (CORRIGÉ — avec mentioned_hospital)
# ========================================================


from django.db import models
import uuid


class Report(models.Model):
    """Monthly reports from hospitals to authorities."""

    STATUS_CHOICES = [
        ("draft", "Brouillon"),
        ("submitted", "Soumis"),
        ("reviewed", "Examine"),
        ("approved", "Approuve"),
        ("rejected", "Rejete"),
    ]

    TYPE_CHOICES = [
        ("monthly_births", "Rapport mensuel naissances"),
        ("monthly_deaths", "Rapport mensuel deces"),
        ("quarterly", "Rapport trimestriel"),
        ("annual", "Rapport annuel"),
        ("audit", "Rapport d'audit"),
        ("custom", "Rapport personnalise"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_id = models.CharField(max_length=50, unique=True)

    # Report info
    report_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)

    # Period
    period_start = models.DateField()
    period_end = models.DateField()

    # Hospital
    hospital = models.ForeignKey(
        "hospitals.Hospital", on_delete=models.CASCADE, related_name="reports"
    )
    submitted_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="submitted_reports",
    )

    # Statistics
    total_births = models.PositiveIntegerField(default=0)
    total_deaths = models.PositiveIntegerField(default=0)
    male_births = models.PositiveIntegerField(default=0)
    female_births = models.PositiveIntegerField(default=0)
    male_deaths = models.PositiveIntegerField(default=0)
    female_deaths = models.PositiveIntegerField(default=0)

    # Data
    data = models.JSONField(default=dict)

    # Files
    pdf_file = models.FileField(upload_to="reports/pdf/", blank=True)
    excel_file = models.FileField(upload_to="reports/excel/", blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    reviewed_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_reports",
    )
    review_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "reports"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.report_id} - {self.title}"


class CitizenReport(models.Model):
    """Citizen reports (fraud, errors, complaints)."""

    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("reviewed", "Examine"),
        ("resolved", "Resolu"),
        ("rejected", "Rejete"),
    ]

    TYPE_CHOICES = [
        ("fraud", "Fraude / Faux certificat"),
        ("error", "Erreur dans un certificat"),
        ("hospital", "Probleme avec un hopital"),
        ("system", "Probleme technique"),
        ("other", "Autre"),
    ]

    SEVERITY_CHOICES = [
        ("low", "Faible"),
        ("medium", "Moyen"),
        ("high", "Eleve"),
        ("critical", "Critique"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_id = models.CharField(max_length=50, unique=True)

    # Report info
    report_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField()
    location = models.CharField(max_length=200)
    severity = models.CharField(
        max_length=20, choices=SEVERITY_CHOICES, default="medium"
    )

    # Optional certificate reference
    certificate_id = models.CharField(max_length=50, blank=True)

    # ✅ NOUVEAU : Hôpital mentionné par le citoyen (optionnel)
    mentioned_hospital = models.ForeignKey(
        "hospitals.Hospital",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="citizen_reports",
    )

    # Contact info
    contact_name = models.CharField(max_length=200, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    is_anonymous = models.BooleanField(default=False)

    # Submitter
    submitted_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="citizen_reports",
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reviewed_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_citizen_reports",
    )
    review_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "citizen_reports"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.report_id} - {self.title}"
