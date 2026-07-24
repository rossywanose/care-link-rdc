from django.db import models
import uuid


class BirthCertificate(models.Model):
    """Birth certificate model."""

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

    # Child info
    child_first_name = models.CharField(max_length=100)
    child_last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    time_of_birth = models.TimeField(blank=True, null=True)
    place_of_birth = models.CharField(max_length=200)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    # Father info
    father_first_name = models.CharField(max_length=100)
    father_last_name = models.CharField(max_length=100)
    father_date_of_birth = models.DateField(blank=True, null=True)
    father_nationality = models.CharField(max_length=50, default='Congolaise')
    father_profession = models.CharField(max_length=100, blank=True)
    father_id_number = models.CharField(max_length=100, blank=True)

    # Mother info
    mother_first_name = models.CharField(max_length=100)
    mother_last_name = models.CharField(max_length=100)
    mother_date_of_birth = models.DateField(blank=True, null=True)
    mother_nationality = models.CharField(max_length=50, default='Congolaise')
    mother_profession = models.CharField(max_length=100, blank=True)
    mother_id_number = models.CharField(max_length=100, blank=True)

    # Hospital info
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='births')
    doctor_name = models.CharField(max_length=200)
    doctor_license = models.CharField(max_length=100, blank=True)

    # Declarant
    declared_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='declared_births')
    declaration_date = models.DateTimeField(auto_now_add=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    validated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_births')
    validation_date = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True)

    # Documents
    medical_certificate = models.FileField(upload_to='births/medical/', blank=True)
    father_id_doc = models.FileField(upload_to='births/ids/', blank=True)
    mother_id_doc = models.FileField(upload_to='births/ids/', blank=True)
    marriage_certificate = models.FileField(upload_to='births/marriage/', blank=True)

    # QR Code
    qr_code = models.ImageField(upload_to='births/qr/', blank=True)

    # Payment
    is_paid = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_date = models.DateTimeField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'birth_certificates'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.certificate_id} - {self.child_first_name} {self.child_last_name}"

    @property
    def child_full_name(self):
        return f"{self.child_first_name} {self.child_last_name}".strip()

    @property
    def father_full_name(self):
        return f"{self.father_first_name} {self.father_last_name}".strip()

    @property
    def mother_full_name(self):
        return f"{self.mother_first_name} {self.mother_last_name}".strip()
