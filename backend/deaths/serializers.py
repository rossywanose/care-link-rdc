# ===========================================
# SERIALIZERS DECES (DEATHS)
# ===========================================

from rest_framework import serializers
from .models import DeathCertificate


class DeathCertificateSerializer(serializers.ModelSerializer):
    """Serializer for DeathCertificate."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)
    full_name = serializers.CharField(read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    declared_by_name = serializers.CharField(
        source="declared_by.full_name", read_only=True
    )
    validated_by_name = serializers.CharField(
        source="validated_by.full_name", read_only=True
    )

    class Meta:
        model = DeathCertificate
        fields = "__all__"
        read_only_fields = [
            "id",
            "certificate_id",
            "created_at",
            "updated_at",
            "validation_date",
            "declared_by",
            "hospital",
            "status",
            "validated_by",
            "rejection_reason",
            "is_paid",
            "payment_amount",
            "payment_date",
            "qr_code",
        ]


class DeathCertificateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating death certificates (hospital only)."""

    class Meta:
        model = DeathCertificate
        fields = [
            "first_name",
            "last_name",
            "gender",
            "date_of_birth",
            "date_of_death",
            "time_of_death",
            "place_of_death",
            "age_at_death",
            "cause_of_death",
            "cause_category",
            "father_first_name",
            "father_last_name",
            "mother_first_name",
            "mother_last_name",
            "spouse_first_name",
            "spouse_last_name",
            "declarant_name",
            "declarant_relationship",
            "declarant_phone",
            "declarant_id_number",
            "doctor_name",
            "doctor_license",
            "death_certificate_medical",
            "declarant_id_doc",
            "police_report",
        ]
        extra_kwargs = {
            "date_of_birth": {"required": False, "allow_null": True},
            "time_of_death": {"required": False, "allow_null": True},
            "age_at_death": {"required": False, "allow_null": True},
            "cause_category": {"required": False, "allow_blank": True},
            "father_first_name": {"required": False, "allow_blank": True},
            "father_last_name": {"required": False, "allow_blank": True},
            "mother_first_name": {"required": False, "allow_blank": True},
            "mother_last_name": {"required": False, "allow_blank": True},
            "spouse_first_name": {"required": False, "allow_blank": True},
            "spouse_last_name": {"required": False, "allow_blank": True},
            "declarant_phone": {"required": False, "allow_blank": True},
            "declarant_id_number": {"required": False, "allow_blank": True},
            "doctor_license": {"required": False, "allow_blank": True},
            "death_certificate_medical": {"required": False},
            "declarant_id_doc": {"required": False},
            "police_report": {"required": False},
        }


class DeathCertificateListSerializer(serializers.ModelSerializer):
    """Light serializer for death certificate lists."""

    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = DeathCertificate
        fields = [
            "id",
            "certificate_id",
            "first_name",
            "last_name",
            "gender",
            "date_of_death",
            "status",
            "hospital",
            "hospital_name",
            "declaration_date",
            # AJOUTÉS pour HospitalCertificats:
            "place_of_death",
            "age_at_death",
            "father_first_name",
            "father_last_name",
            "mother_first_name",
            "mother_last_name",
            "doctor_name",
            "cause_of_death",
        ]
