# ===========================
# Serializers Publications
# ===========================

from rest_framework import serializers
from .models import Publication


class PublicationSerializer(serializers.ModelSerializer):
    period_type_display = serializers.CharField(
        source="get_period_type_display", read_only=True
    )
    geo_level_display = serializers.CharField(
        source="get_geo_level_display", read_only=True
    )
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )

    class Meta:
        model = Publication
        fields = [
            "id",
            "publication_id",
            "title",
            "description",
            "period_type",
            "period_type_display",
            "period_start",
            "period_end",
            "geo_level",
            "geo_level_display",
            "province",
            "city",
            "commune",
            "total_births",
            "total_deaths",
            "male_births",
            "female_births",
            "male_deaths",
            "female_deaths",
            "data",
            "published_by",
            "published_by_name",
            "is_published",
            "published_at",
        ]
        read_only_fields = [
            "id",
            "publication_id",
            "published_by",
            "published_by_name",
            "published_at",
            "period_type_display",
            "geo_level_display",
        ]


class PublicationListSerializer(serializers.ModelSerializer):
    period_type_display = serializers.CharField(
        source="get_period_type_display", read_only=True
    )
    geo_level_display = serializers.CharField(
        source="get_geo_level_display", read_only=True
    )

    class Meta:
        model = Publication
        fields = [
            "id",
            "publication_id",
            "title",
            "period_type",
            "period_type_display",
            "period_start",
            "period_end",
            "geo_level",
            "geo_level_display",
            "province",
            "city",
            "commune",
            "total_births",
            "total_deaths",
            "published_at",
        ]
