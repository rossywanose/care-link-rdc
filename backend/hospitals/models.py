# ========================================
# MODELS HOPITALS (CORRIGÉ — Licence + Paiement $1)
# ========================================

from django.db import models
import uuid

# Dictionnaire des codes provinces
PROVINCE_CODES = {
    "Kinshasa": "KIN",
    "Bas-Uele": "BUE",
    "Equateur": "EQU",
    "Haut-Katanga": "HKA",
    "Haut-Lomami": "HLO",
    "Haut-Uele": "HUE",
    "Ituri": "ITU",
    "Kasai": "KAS",
    "Kasai-Central": "KCE",
    "Kasai-Oriental": "KOR",
    "Kongo-Central": "KCO",
    "Kwango": "KWA",
    "Kwilu": "KWI",
    "Lomami": "LOM",
    "Lualaba": "LUA",
    "Mai-Ndombe": "MND",
    "Maniema": "MAN",
    "Mongala": "MON",
    "Nord-Kivu": "NKI",
    "Nord-Ubangi": "NUB",
    "Sankuru": "SAN",
    "Sud-Kivu": "SKI",
    "Sud-Ubangi": "SUB",
    "Tanganyika": "TAN",
    "Tshopo": "TSH",
    "Tshuapa": "TSU",
}


class Hospital(models.Model):
    """Hospital model for Care-Link RDC."""

    TYPE_CHOICES = [
        ("public", "Public"),
        ("prive", "Privé"),
        ("confessionnel", "Confessionnel"),
        ("ong", "ONG / Humanitaire"),
    ]

    STATUS_CHOICES = [
        ("active", "Actif"),
        ("inactive", "Inactif"),
        ("pending", "En attente de paiement"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital_id = models.CharField(max_length=20, unique=True, blank=True)
    official_license = models.CharField(
        max_length=30, unique=True, blank=True, null=True
    )
    name = models.CharField(max_length=200)
    abbreviation = models.CharField(max_length=10, blank=True)
    hospital_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default="public"
    )
    level = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Location
    province = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    commune = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)

    # Contact
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    # Logo
    logo = models.ImageField(upload_to="hospital_logos/", blank=True, null=True)

    # Director
    director_name = models.CharField(max_length=200, blank=True)
    director_phone = models.CharField(max_length=20, blank=True)
    director_email = models.EmailField(blank=True)

    # Capacity
    capacity = models.PositiveIntegerField(default=0)
    staff_count = models.PositiveIntegerField(default=0)

    # License (ancien — gardé pour compatibilité)
    license_number = models.CharField(max_length=100, blank=True)
    license_expiry = models.DateField(blank=True, null=True)

    # Services
    services = models.JSONField(default=list)

    # Description
    description = models.TextField(blank=True)

    # Stats
    total_births = models.PositiveIntegerField(default=0)
    total_deaths = models.PositiveIntegerField(default=0)
    total_certificates = models.PositiveIntegerField(default=0)
    validation_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # Payment — $1 frais d'ouverture
    opening_fee_paid = models.BooleanField(default=False)
    opening_fee_paid_at = models.DateTimeField(blank=True, null=True)
    opening_fee_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=1.00
    )

    # Subscription (optionnel — pas de blocage)
    subscription_plan = models.CharField(max_length=20, blank=True)
    subscription_expiry = models.DateField(blank=True, null=True)
    is_paid = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "hospitals"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.official_license or self.hospital_id})"

    def generate_official_license(self):
        """Génère la licence officielle : PROV-COMM-ANNEE-SEQUENCE"""
        import datetime

        year = datetime.datetime.now().year

        # Code province
        province_code = PROVINCE_CODES.get(self.province, "UNK")
        if not province_code:
            province_code = self.province[:3].upper() if self.province else "UNK"

        # Code commune (3 premières lettres, majuscules)
        commune_code = ""
        if self.commune:
            words = self.commune.split("_")
            if len(words) > 1:
                commune_code = "".join([w[0].upper() for w in words[:3]])
            else:
                commune_code = self.commune[:3].upper()
        else:
            commune_code = "UNK"

        # Compteur pour cette année/province/commune
        count = (
            Hospital.objects.filter(
                official_license__startswith=f"{province_code}-{commune_code}-{year}"
            ).count()
            + 1
        )

        return f"{province_code}-{commune_code}-{year}-{count:04d}"

    def save(self, *args, **kwargs):
        # Générer hospital_id (ancien format)
        if not self.hospital_id:
            import datetime

            year = datetime.datetime.now().year
            count = Hospital.objects.filter(created_at__year=year).count() + 1
            self.hospital_id = f"H{year}-{count:04d}"

        # Générer la licence officielle si vide et infos géo disponibles
        if (
            not self.official_license
            and self.province
            and self.commune
            and self.opening_fee_paid
        ):
            self.official_license = self.generate_official_license()

        super().save(*args, **kwargs)

    def activate_after_payment(self):
        """Active l'hôpital après paiement du $1"""
        import datetime
        from django.utils import timezone

        self.opening_fee_paid = True
        self.opening_fee_paid_at = timezone.now()
        self.status = "active"
        self.is_paid = True

        # Générer la licence officielle
        if not self.official_license and self.province and self.commune:
            self.official_license = self.generate_official_license()

        self.save()
        return self.official_license
