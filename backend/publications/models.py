# ================================
# Models Publications
# ================================

from django.db import models
import uuid


class Publication(models.Model):
    """Publications officielles des autorites (visibles publiquement)."""

    PERIOD_CHOICES = [
        ("day", "Jour"),
        ("week", "Semaine"),
        ("month", "Mois"),
        ("year", "Annee"),
    ]

    GEO_LEVEL_CHOICES = [
        ("national", "National"),
        ("province", "Province"),
        ("city", "Ville"),
        ("commune", "Commune"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    publication_id = models.CharField(max_length=50, unique=True)

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)

    period_type = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()

    geo_level = models.CharField(
        max_length=10, choices=GEO_LEVEL_CHOICES, default="national"
    )
    province = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    commune = models.CharField(max_length=100, blank=True)

    total_births = models.PositiveIntegerField(default=0)
    total_deaths = models.PositiveIntegerField(default=0)
    male_births = models.PositiveIntegerField(default=0)
    female_births = models.PositiveIntegerField(default=0)
    male_deaths = models.PositiveIntegerField(default=0)
    female_deaths = models.PositiveIntegerField(default=0)

    data = models.JSONField(default=dict)

    published_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="publications",
    )

    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "publications"
        ordering = ["-published_at"]

    def __str__(self):
        return f"{self.publication_id} - {self.title}"
