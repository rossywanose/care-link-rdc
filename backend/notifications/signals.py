# =============================
# Signals Signalemeny
# =============================

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification


def create_notification(
    user,
    title,
    message,
    notification_type,
    priority="normal",
    related_type="",
    related_id="",
):
    if not user:
        return None
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        related_type=related_type,
        related_id=str(related_id) if related_id else "",
    )


# ========== SIGNAUX DÉCÈS ==========
try:
    from deaths.models import DeathCertificate

    @receiver(post_save, sender=DeathCertificate)
    def death_notification(sender, instance, created, **kwargs):
        if created:
            # Notifier TOUTES les autorités (sans filtre province)
            from users.models import User

            for authority in User.objects.filter(role="authority", is_active=True):
                create_notification(
                    user=authority,
                    title="Nouveau décès déclaré",
                    message=f"Décès déclaré à {instance.hospital.name if instance.hospital else 'hôpital'} - {instance.first_name} {instance.last_name}",
                    notification_type="certificate",
                    priority="high",
                    related_type="death",
                    related_id=instance.id,
                )
            # Notifier le déclarant
            if instance.declared_by:
                create_notification(
                    user=instance.declared_by,
                    title="Décès enregistré",
                    message=f"Le décès de {instance.first_name} a été déclaré.",
                    notification_type="certificate",
                    priority="normal",
                    related_type="death",
                    related_id=instance.id,
                )
        elif instance.status == "approved":
            if instance.declared_by:
                create_notification(
                    user=instance.declared_by,
                    title="Décès validé",
                    message="L'acte de décès est disponible.",
                    notification_type="validation",
                    priority="high",
                    related_type="death",
                    related_id=instance.id,
                )

except ImportError:
    pass


# ========== SIGNAUX NAISSANCES ==========
try:
    from births.models import BirthCertificate

    @receiver(post_save, sender=BirthCertificate)
    def birth_notification(sender, instance, created, **kwargs):
        if created:
            # Notifier TOUTES les autorités (sans filtre province)
            from users.models import User

            for authority in User.objects.filter(role="authority", is_active=True):
                create_notification(
                    user=authority,
                    title="Nouvelle naissance déclarée",
                    message=f"Naissance à {instance.hospital.name if instance.hospital else 'hôpital'} - {instance.child_first_name} {instance.child_last_name}",
                    notification_type="certificate",
                    priority="high",
                    related_type="birth",
                    related_id=instance.id,
                )
            # Notifier le déclarant
            if instance.declared_by:
                create_notification(
                    user=instance.declared_by,
                    title="Naissance enregistrée",
                    message=f"La naissance de {instance.child_first_name} a été déclarée.",
                    notification_type="certificate",
                    priority="normal",
                    related_type="birth",
                    related_id=instance.id,
                )
        elif instance.status == "approved":
            if instance.declared_by:
                create_notification(
                    user=instance.declared_by,
                    title="Naissance validée",
                    message="L'acte de naissance est disponible.",
                    notification_type="validation",
                    priority="high",
                    related_type="birth",
                    related_id=instance.id,
                )

except ImportError:
    pass


# ========== SIGNAUX HÔPITAUX ==========
try:
    from hospitals.models import Hospital

    @receiver(post_save, sender=Hospital)
    def hospital_notification(sender, instance, created, **kwargs):
        if not created and instance.status == "approved":
            if hasattr(instance, "admin_user") and instance.admin_user:
                create_notification(
                    user=instance.admin_user,
                    title="Hôpital approuvé",
                    message=f"{instance.name} est approuvé. Vous pouvez déclarer.",
                    notification_type="validation",
                    priority="high",
                    related_type="hospital",
                    related_id=instance.id,
                )

except ImportError:
    pass


# ========== SIGNAUX SIGNALEMENTS CITOYENS ==========
try:
    from reports.models import CitizenReport

    @receiver(post_save, sender=CitizenReport)
    def citizen_report_notification(sender, instance, created, **kwargs):
        if created:
            # Notifier TOUTES les autorités (sans filtre province)
            from users.models import User

            for authority in User.objects.filter(role="authority", is_active=True):
                create_notification(
                    user=authority,
                    title="Nouveau signalement citoyen",
                    message=f"Signalement: {instance.title}",
                    notification_type="report",
                    priority="high",
                    related_type="citizen_report",
                    related_id=instance.id,
                )
            # Notifier le citoyen
            if instance.submitted_by:
                create_notification(
                    user=instance.submitted_by,
                    title="Signalement envoyé",
                    message="Votre signalement a été transmis aux autorités.",
                    notification_type="report",
                    priority="normal",
                    related_type="citizen_report",
                    related_id=instance.id,
                )
        elif instance.status == "resolved" and instance.review_notes:
            if instance.submitted_by:
                create_notification(
                    user=instance.submitted_by,
                    title="Réponse à votre signalement",
                    message=f"Réponse: {instance.review_notes[:100]}...",
                    notification_type="report",
                    priority="high",
                    related_type="citizen_report",
                    related_id=instance.id,
                )

except ImportError:
    pass


# ========== SIGNAUX RAPPORTS HÔPITAUX ==========
try:
    from reports.models import Report

    @receiver(post_save, sender=Report)
    def report_notification(sender, instance, created, **kwargs):
        if created:
            # Notifier TOUTES les autorités (sans filtre province)
            from users.models import User

            for authority in User.objects.filter(role="authority", is_active=True):
                create_notification(
                    user=authority,
                    title="Nouveau rapport d'hôpital",
                    message=f"Rapport: {instance.title}",
                    notification_type="report",
                    priority="normal",
                    related_type="report",
                    related_id=instance.id,
                )
        elif instance.status == "approved":
            if instance.submitted_by:
                create_notification(
                    user=instance.submitted_by,
                    title="Rapport approuvé",
                    message=f"Votre rapport '{instance.title}' a été approuvé.",
                    notification_type="validation",
                    priority="normal",
                    related_type="report",
                    related_id=instance.id,
                )
        elif instance.status == "rejected":
            if instance.submitted_by:
                create_notification(
                    user=instance.submitted_by,
                    title="Rapport rejeté",
                    message=f"Votre rapport '{instance.title}' a été rejeté. Raison: {instance.review_notes[:100]}...",
                    notification_type="alert",
                    priority="high",
                    related_type="report",
                    related_id=instance.id,
                )

except ImportError:
    pass
