# ============================
# Views Publications
# ============================


from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth, TruncDay
from .models import Publication
from .serializers import PublicationSerializer, PublicationListSerializer
from users.permissions import IsAuthorityOrAdmin
from births.models import BirthCertificate
from deaths.models import DeathCertificate
import datetime


class PublicationListView(generics.ListAPIView):
    """Lister les publications (public)."""

    serializer_class = PublicationListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Publication.objects.filter(is_published=True)


class PublicationDetailView(generics.RetrieveAPIView):
    """Detail d'une publication (public)."""

    queryset = Publication.objects.filter(is_published=True)
    serializer_class = PublicationSerializer
    permission_classes = [permissions.AllowAny]


class PublicationCreateView(generics.CreateAPIView):
    """Creer une publication (autorite uniquement)."""

    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    permission_classes = [IsAuthorityOrAdmin]

    def create(self, request, *args, **kwargs):
        data = request.data
        count = (
            Publication.objects.filter(
                published_at__year=datetime.datetime.now().year
            ).count()
            + 1
        )
        publication_id = f"PUB-{datetime.datetime.now().year}-{count:04d}"

        stats = self._calculate_stats(data)

        publication = Publication.objects.create(
            publication_id=publication_id,
            title=data.get("title"),
            description=data.get("description", ""),
            period_type=data.get("period_type", "month"),
            period_start=data.get("period_start"),
            period_end=data.get("period_end"),
            geo_level=data.get("geo_level", "national"),
            province=data.get("province", ""),
            city=data.get("city", ""),
            commune=data.get("commune", ""),
            total_births=stats["total_births"],
            total_deaths=stats["total_deaths"],
            male_births=stats["male_births"],
            female_births=stats["female_births"],
            male_deaths=stats["male_deaths"],
            female_deaths=stats["female_deaths"],
            data=stats["details"],
            published_by=request.user,
            is_published=True,
        )

        serializer = self.get_serializer(publication)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _calculate_stats(self, data):
        period_type = data.get("period_type", "month")
        geo_level = data.get("geo_level", "national")
        province = data.get("province", "")
        city = data.get("city", "")
        commune = data.get("commune", "")
        period_start = data.get("period_start")
        period_end = data.get("period_end")

        birth_filter = Q(
            created_at__date__gte=period_start, created_at__date__lte=period_end
        )
        death_filter = Q(
            created_at__date__gte=period_start, created_at__date__lte=period_end
        )

        if geo_level == "province" and province:
            birth_filter &= Q(hospital__province__iexact=province)
            death_filter &= Q(hospital__province__iexact=province)
        elif geo_level == "city" and city:
            birth_filter &= Q(hospital__city__iexact=city)
            death_filter &= Q(hospital__city__iexact=city)
        elif geo_level == "commune" and commune:
            birth_filter &= Q(hospital__commune__iexact=commune)
            death_filter &= Q(hospital__commune__iexact=commune)

        births = BirthCertificate.objects.filter(birth_filter)
        total_births = births.count()
        male_births = births.filter(gender="M").count()
        female_births = births.filter(gender="F").count()

        deaths = DeathCertificate.objects.filter(death_filter)
        total_deaths = deaths.count()
        male_deaths = deaths.filter(gender="M").count()
        female_deaths = deaths.filter(gender="F").count()

        details = self._get_period_details(period_type, birth_filter, death_filter)

        if geo_level == "national":
            details["by_province"] = self._get_province_stats(period_start, period_end)

        return {
            "total_births": total_births,
            "total_deaths": total_deaths,
            "male_births": male_births,
            "female_births": female_births,
            "male_deaths": male_deaths,
            "female_deaths": female_deaths,
            "details": details,
        }

    def _get_period_details(self, period_type, birth_filter, death_filter):
        """Compatible SQLite - pas de .extra() avec EXTRACT()."""

        if period_type == "day":
            # Par heure - on fait le group by en Python
            birth_list = list(
                BirthCertificate.objects.filter(birth_filter).values("created_at")
            )
            death_list = list(
                DeathCertificate.objects.filter(death_filter).values("created_at")
            )

            birth_hours = {}
            death_hours = {}
            for item in birth_list:
                h = item["created_at"].hour
                birth_hours[h] = birth_hours.get(h, 0) + 1
            for item in death_list:
                h = item["created_at"].hour
                death_hours[h] = death_hours.get(h, 0) + 1

            return {
                "births_by_hour": [
                    {"hour": k, "count": v} for k, v in sorted(birth_hours.items())
                ],
                "deaths_by_hour": [
                    {"hour": k, "count": v} for k, v in sorted(death_hours.items())
                ],
            }

        elif period_type in ("week", "month"):
            # Par jour - compatible SQLite avec TruncDay
            # FIX: Convertir les objets datetime en strings ISO pour JSONField
            birth_q = list(
                BirthCertificate.objects.filter(birth_filter)
                .annotate(day=TruncDay("created_at"))
                .values("day")
                .annotate(count=Count("id"))
                .order_by("day")
            )
            death_q = list(
                DeathCertificate.objects.filter(death_filter)
                .annotate(day=TruncDay("created_at"))
                .values("day")
                .annotate(count=Count("id"))
                .order_by("day")
            )
            # Convertir les objets datetime en strings
            for item in birth_q:
                if item["day"] and hasattr(item["day"], "isoformat"):
                    item["day"] = item["day"].isoformat()
            for item in death_q:
                if item["day"] and hasattr(item["day"], "isoformat"):
                    item["day"] = item["day"].isoformat()

            return {
                "births_by_day": birth_q,
                "deaths_by_day": death_q,
            }

        elif period_type == "year":
            # Par mois
            # FIX: Convertir les objets datetime en strings ISO pour JSONField
            birth_q = list(
                BirthCertificate.objects.filter(birth_filter)
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(count=Count("id"))
                .order_by("month")
            )
            death_q = list(
                DeathCertificate.objects.filter(death_filter)
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(count=Count("id"))
                .order_by("month")
            )
            # Convertir les objets datetime en strings
            for item in birth_q:
                if item["month"] and hasattr(item["month"], "isoformat"):
                    item["month"] = item["month"].isoformat()
            for item in death_q:
                if item["month"] and hasattr(item["month"], "isoformat"):
                    item["month"] = item["month"].isoformat()

            return {
                "births_by_month": birth_q,
                "deaths_by_month": death_q,
            }

        return {}

    def _get_province_stats(self, start, end):
        birth_filter = Q(created_at__date__gte=start, created_at__date__lte=end)
        death_filter = Q(created_at__date__gte=start, created_at__date__lte=end)
        provinces = {}

        for item in (
            BirthCertificate.objects.filter(birth_filter)
            .values("hospital__province")
            .annotate(count=Count("id"))
            .order_by("-count")
        ):
            prov = item["hospital__province"] or "Inconnu"
            provinces.setdefault(prov, {"births": 0, "deaths": 0})
            provinces[prov]["births"] = item["count"]

        for item in (
            DeathCertificate.objects.filter(death_filter)
            .values("hospital__province")
            .annotate(count=Count("id"))
            .order_by("-count")
        ):
            prov = item["hospital__province"] or "Inconnu"
            provinces.setdefault(prov, {"births": 0, "deaths": 0})
            provinces[prov]["deaths"] = item["count"]

        return [
            {"province": k, "births": v["births"], "deaths": v["deaths"]}
            for k, v in sorted(
                provinces.items(),
                key=lambda x: x[1]["births"] + x[1]["deaths"],
                reverse=True,
            )
        ]


class PublicationStatsPreviewView(generics.GenericAPIView):
    """Previsualiser les stats avant publication (autorite)."""

    permission_classes = [IsAuthorityOrAdmin]

    def post(self, request):
        creator = PublicationCreateView()
        stats = creator._calculate_stats(request.data)
        return Response(stats)
