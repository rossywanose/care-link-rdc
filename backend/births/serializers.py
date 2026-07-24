# =======================================
# SERIALIZERS NAISSANCE (BIRTH)
# =======================================

from rest_framework import serializers
from .models import BirthCertificate


class BirthCertificateSerializer(serializers.ModelSerializer):
    """Serializer for BirthCertificate."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)
    child_full_name = serializers.CharField(read_only=True)
    father_full_name = serializers.CharField(read_only=True)
    mother_full_name = serializers.CharField(read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    declared_by_name = serializers.CharField(
        source="declared_by.full_name", read_only=True
    )
    validated_by_name = serializers.CharField(
        source="validated_by.full_name", read_only=True
    )

    class Meta:
        model = BirthCertificate
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


class BirthCertificateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating birth certificates (hospital only)."""

    class Meta:
        model = BirthCertificate
        fields = [
            "child_first_name",
            "child_last_name",
            "gender",
            "date_of_birth",
            "time_of_birth",
            "place_of_birth",
            "weight",
            "father_first_name",
            "father_last_name",
            "father_date_of_birth",
            "father_nationality",
            "father_profession",
            "father_id_number",
            "mother_first_name",
            "mother_last_name",
            "mother_date_of_birth",
            "mother_nationality",
            "mother_profession",
            "mother_id_number",
            "doctor_name",
            "doctor_license",
            "medical_certificate",
            "father_id_doc",
            "mother_id_doc",
            "marriage_certificate",
        ]
        extra_kwargs = {
            "time_of_birth": {"required": False, "allow_null": True},
            "weight": {"required": False, "allow_null": True},
            "father_date_of_birth": {"required": False, "allow_null": True},
            "father_profession": {"required": False, "allow_blank": True},
            "father_id_number": {"required": False, "allow_blank": True},
            "mother_date_of_birth": {"required": False, "allow_null": True},
            "mother_profession": {"required": False, "allow_blank": True},
            "mother_id_number": {"required": False, "allow_blank": True},
            "doctor_license": {"required": False, "allow_blank": True},
            "medical_certificate": {"required": False},
            "father_id_doc": {"required": False},
            "mother_id_doc": {"required": False},
            "marriage_certificate": {"required": False},
        }


class BirthCertificateListSerializer(serializers.ModelSerializer):
    """Light serializer for birth certificate lists."""

    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = BirthCertificate
        fields = [
            "id",
            "certificate_id",
            "child_first_name",
            "child_last_name",
            "gender",
            "date_of_birth",
            "status",
            "hospital",
            "hospital_name",
            "declaration_date",
            # AJOUTÉS pour HospitalCertificats:
            "place_of_birth",
            "weight",
            "father_first_name",
            "father_last_name",
            "mother_first_name",
            "mother_last_name",
            "doctor_name",
        ]
