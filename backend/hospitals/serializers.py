# ==========================================
# Serializers Hopitals (CORRIGÉ)
# ==========================================

from rest_framework import serializers
from .models import Hospital


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model."""

    type_display = serializers.CharField(
        source="get_hospital_type_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = "__all__"
        read_only_fields = [
            "id",
            "hospital_id",
            "created_at",
            "updated_at",
            "total_births",
            "total_deaths",
            "total_certificates",
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class HospitalListSerializer(serializers.ModelSerializer):
    """Light serializer for hospital lists."""

    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = [
            "id",
            "hospital_id",
            "name",
            "abbreviation",
            "hospital_type",
            "status",
            "province",
            "commune",
            "phone",
            "city",
            "address",
            "email",
            "website",
            "logo",
            "logo_url",
            "director_name",
            "director_phone",
            "director_email",
            "capacity",
            "staff_count",
            "license_number",
            "license_expiry",
            "official_license",
            "services",
            "description",
            "total_births",
            "total_deaths",
            "total_certificates",
            "validation_rate",
            "subscription_plan",
            "is_paid",
            "created_at",
            "updated_at",
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class HospitalUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating hospital details by staff."""

    class Meta:
        model = Hospital
        fields = [
            "name",
            "abbreviation",
            "hospital_type",
            "level",
            "province",
            "city",
            "commune",
            "address",
            "phone",
            "email",
            "website",
            "logo",
            "description",
            "director_name",
            "director_phone",
            "director_email",
            "capacity",
            "staff_count",
            "services",
            "license_number",
            "license_expiry",
        ]

    def validate_services(self, value):
        """Handle services as string JSON or list."""
        import json

        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                return [s.strip() for s in value.split(",") if s.strip()]
        elif isinstance(value, list):
            return value
        return []

    def validate_capacity(self, value):
        """Ensure capacity is an integer."""
        try:
            return int(value) if value else 0
        except (ValueError, TypeError):
            return 0

    def validate_staff_count(self, value):
        """Ensure staff_count is an integer."""
        try:
            return int(value) if value else 0
        except (ValueError, TypeError):
            return 0

    def to_internal_value(self, data):
        """Convert string values to proper types before validation."""
        if "services" in data and isinstance(data["services"], str):
            import json

            try:
                data = dict(data)
                parsed = json.loads(data["services"])
                if isinstance(parsed, list):
                    data["services"] = parsed
            except (json.JSONDecodeError, TypeError):
                pass
        return super().to_internal_value(data)
