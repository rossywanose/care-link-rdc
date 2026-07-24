# ============================
# Models Notification
# ============================


from django.db import models
import uuid


class Notification(models.Model):
    """Notification model for users."""

    TYPE_CHOICES = [
        ("certificate", "Certificat"),
        ("validation", "Validation"),
        ("payment", "Paiement"),
        ("report", "Rapport"),
        ("system", "Système"),
        ("alert", "Alerte"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Basse"),
        ("normal", "Normale"),
        ("high", "Haute"),
        ("urgent", "Urgente"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="normal"
    )
    related_type = models.CharField(max_length=50, blank=True)
    related_id = models.CharField(max_length=100, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    email_sent = models.BooleanField(default=False)
    push_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class NotificationPreference(models.Model):
    """User notification preferences."""

    user = models.OneToOneField(
        "users.User", on_delete=models.CASCADE, related_name="notification_prefs"
    )
    email_new_certificate = models.BooleanField(default=True)
    email_validation = models.BooleanField(default=True)
    email_report = models.BooleanField(default=False)
    email_daily_summary = models.BooleanField(default=True)
    push_new_certificate = models.BooleanField(default=True)
    push_validation = models.BooleanField(default=True)
    push_urgent = models.BooleanField(default=True)
    push_system = models.BooleanField(default=False)

    class Meta:
        db_table = "notification_preferences"
