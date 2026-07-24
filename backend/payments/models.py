# ==========================================
# MODELS PAYMENTS (CORRIGÉ — Frais d'ouverture $1)
# ==========================================

from django.db import models
import uuid


class Payment(models.Model):
    """Payment model for Care-Link RDC — Frais d'ouverture hôpital."""

    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("processing", "En cours"),
        ("success", "Succès"),
        ("failed", "Échoué"),
        ("cancelled", "Annulé"),
    ]

    METHOD_CHOICES = [
        ("airtel", "Airtel Money"),
        ("visa", "Visa / Carte bancaire"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_id = models.CharField(max_length=50, unique=True, blank=True)

    # Relations
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="payments"
    )
    hospital = models.ForeignKey(
        "hospitals.Hospital",
        on_delete=models.CASCADE,
        related_name="payments",
        null=True,
        blank=True,
    )

    # Détails du paiement
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    currency = models.CharField(max_length=3, default="USD")
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Airtel Money
    phone_number = models.CharField(max_length=20, blank=True)

    # Visa / Carte (tokenisé — jamais stocker le numéro complet)
    card_last_four = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)

    # Transaction externe (Stripe, Airtel API, etc.)
    transaction_reference = models.CharField(max_length=100, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)

    # Description
    description = models.TextField(default="Frais d'ouverture de compte hôpital")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.payment_id} — {self.amount} {self.currency} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.payment_id:
            import datetime

            year = datetime.datetime.now().year
            count = Payment.objects.filter(created_at__year=year).count() + 1
            self.payment_id = f"PAY-{year}-{count:06d}"
        super().save(*args, **kwargs)

    def mark_success(self):
        """Marquer le paiement comme réussi"""
        from django.utils import timezone

        self.status = "success"
        self.paid_at = timezone.now()
        self.save()

    def mark_failed(self, reason=""):
        """Marquer le paiement comme échoué"""
        self.status = "failed"
        self.description += f" | Échec: {reason}" if reason else ""
        self.save()
