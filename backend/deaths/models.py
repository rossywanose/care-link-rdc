from django.db import models
import uuid


class DeathCertificate(models.Model):
    """Death certificate model."""

    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('pending', 'En attente'),
        ('approved', 'Validé'),
        ('rejected', 'Rejeté'),
        ('paid', 'Payé'),
    ]

    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    certificate_id = models.CharField(max_length=50, unique=True)

    # Deceased info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(blank=True, null=True)
    date_of_death = models.DateField()
    time_of_death = models.TimeField(blank=True, null=True)
    place_of_death = models.CharField(max_length=200)
    age_at_death = models.PositiveIntegerField(blank=True, null=True)

    # Cause of death
    cause_of_death = models.TextField()
    cause_category = models.CharField(max_length=100, blank=True)

    # Father info
    father_first_name = models.CharField(max_length=100, blank=True)
    father_last_name = models.CharField(max_length=100, blank=True)

    # Mother info
    mother_first_name = models.CharField(max_length=100, blank=True)
    mother_last_name = models.CharField(max_length=100, blank=True)

    # Spouse info (if applicable)
    spouse_first_name = models.CharField(max_length=100, blank=True)
    spouse_last_name = models.CharField(max_length=100, blank=True)

    # Declarant info
    declarant_name = models.CharField(max_length=200)
    declarant_relationship = models.CharField(max_length=100)
    declarant_phone = models.CharField(max_length=20, blank=True)
    declarant_id_number = models.CharField(max_length=100, blank=True)

    # Hospital info
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='deaths')
    doctor_name = models.CharField(max_length=200)
    doctor_license = models.CharField(max_length=100, blank=True)

    # Declared by
    declared_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='declared_deaths')
    declaration_date = models.DateTimeField(auto_now_add=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    validated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_deaths')
    validation_date = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True)

    # Documents
    death_certificate_medical = models.FileField(upload_to='deaths/medical/', blank=True)
    declarant_id_doc = models.FileField(upload_to='deaths/ids/', blank=True)
    police_report = models.FileField(upload_to='deaths/police/', blank=True)

    # QR Code
    qr_code = models.ImageField(upload_to='deaths/qr/', blank=True)

    # Payment
    is_paid = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_date = models.DateTimeField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'death_certificates'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.certificate_id} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
