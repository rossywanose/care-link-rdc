# ===============================
# Signals Hopitals
# ===============================

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from births.models import BirthCertificate
from deaths.models import DeathCertificate
from .models import Hospital


def update_hospital_stats(hospital):
    """Recalculate and update hospital statistics."""
    if not hospital:
        return

    total_births = BirthCertificate.objects.filter(hospital=hospital).count()
    total_deaths = DeathCertificate.objects.filter(hospital=hospital).count()
    total_certs = total_births + total_deaths

    # Validation rate: approved certificates / total certificates
    approved_births = BirthCertificate.objects.filter(
        hospital=hospital, status="approved"
    ).count()
    approved_deaths = DeathCertificate.objects.filter(
        hospital=hospital, status="approved"
    ).count()
    total_approved = approved_births + approved_deaths

    validation_rate = (total_approved / total_certs * 100) if total_certs > 0 else 0.00

    hospital.total_births = total_births
    hospital.total_deaths = total_deaths
    hospital.total_certificates = total_certs
    hospital.validation_rate = round(validation_rate, 2)
    hospital.save(
        update_fields=[
            "total_births",
            "total_deaths",
            "total_certificates",
            "validation_rate",
        ]
    )


@receiver(post_save, sender=BirthCertificate)
def update_hospital_on_birth_save(sender, instance, **kwargs):
    """Update hospital stats when a birth certificate is created or updated."""
    if instance.hospital:
        update_hospital_stats(instance.hospital)


@receiver(post_delete, sender=BirthCertificate)
def update_hospital_on_birth_delete(sender, instance, **kwargs):
    """Update hospital stats when a birth certificate is deleted."""
    if instance.hospital:
        update_hospital_stats(instance.hospital)


@receiver(post_save, sender=DeathCertificate)
def update_hospital_on_death_save(sender, instance, **kwargs):
    """Update hospital stats when a death certificate is created or updated."""
    if instance.hospital:
        update_hospital_stats(instance.hospital)


@receiver(post_delete, sender=DeathCertificate)
def update_hospital_on_death_delete(sender, instance, **kwargs):
    """Update hospital stats when a death certificate is deleted."""
    if instance.hospital:
        update_hospital_stats(instance.hospital)
