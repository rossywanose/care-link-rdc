# ============================
# Urls Publications
# ============================


from django.urls import path
from .views import (
    PublicationListView,
    PublicationDetailView,
    PublicationCreateView,
    PublicationStatsPreviewView,
)

urlpatterns = [
    path("", PublicationListView.as_view(), name="publication-list"),
    path("create/", PublicationCreateView.as_view(), name="publication-create"),
    path("preview/", PublicationStatsPreviewView.as_view(), name="publication-preview"),
    path("<uuid:pk>/", PublicationDetailView.as_view(), name="publication-detail"),
]
