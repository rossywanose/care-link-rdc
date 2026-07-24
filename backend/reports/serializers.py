# =============================================
# Serializers Reports (CORRIGÉ DÉFINITIF)
# =============================================

from rest_framework import serializers
from .models import Report, CitizenReport


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    type_display = serializers.CharField(
        source="get_report_type_display", read_only=True
    )
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    submitted_by_name = serializers.CharField(
        source="submitted_by.full_name", read_only=True
    )
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.full_name", read_only=True
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "report_id",
            "report_type",
            "title",
            "description",
            "period_start",
            "period_end",
            "hospital",
            "submitted_by",
            "total_births",
            "total_deaths",
            "male_births",
            "female_births",
            "male_deaths",
            "female_deaths",
            "data",
            "pdf_file",
            "excel_file",
            "status",
            "reviewed_by",
            "review_notes",
            "created_at",
            "updated_at",
            "submitted_at",
            "reviewed_at",
            # Read-only display fields
            "status_display",
            "type_display",
            "hospital_name",
            "submitted_by_name",
            "reviewed_by_name",
        ]
        read_only_fields = [
            "id",
            "report_id",
            "created_at",
            "updated_at",
            "submitted_at",
            "reviewed_at",
            "status_display",
            "type_display",
            "hospital_name",
            "submitted_by_name",
            "reviewed_by_name",
        ]

    def create(self, validated_data):
        """Créer le rapport — hospital et submitted_by sont gérés par la view"""
        # Retirer les champs read-only qui pourraient traîner
        validated_data.pop("submitted_by", None)
        validated_data.pop("hospital", None)
        validated_data.pop("reviewed_by", None)
        return super().create(validated_data)


class ReportListSerializer(serializers.ModelSerializer):
    """Light serializer for report lists."""

    class Meta:
        model = Report
        fields = [
            "id",
            "report_id",
            "title",
            "report_type",
            "status",
            "hospital",
            "period_start",
            "period_end",
            "created_at",
        ]


class CitizenReportSerializer(serializers.ModelSerializer):
    """Serializer for CitizenReport."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    type_display = serializers.CharField(
        source="get_report_type_display", read_only=True
    )
    severity_display = serializers.CharField(
        source="get_severity_display", read_only=True
    )
    submitted_by_name = serializers.CharField(
        source="submitted_by.full_name", read_only=True
    )

    class Meta:
        model = CitizenReport
        fields = "__all__"
        read_only_fields = [
            "id",
            "report_id",
            "created_at",
            "updated_at",
            "reviewed_at",
        ]
