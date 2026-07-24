from django.urls import path
from .views import (
    DeathListView,
    DeathDetailView,
    DeathCreateView,
    DeathUpdateView,
    DeathValidateView,
    DeathStatsView,
    DeathCertificatePDFView,
    DeathQRCodeView,
    DeathCertificatePreviewView,
)

urlpatterns = [
    path("", DeathListView.as_view(), name="death-list"),
    path("stats/", DeathStatsView.as_view(), name="death-stats"),
    path("create/", DeathCreateView.as_view(), name="death-create"),
    path("<uuid:pk>/", DeathDetailView.as_view(), name="death-detail"),
    path("<uuid:pk>/update/", DeathUpdateView.as_view(), name="death-update"),
    path("<uuid:pk>/validate/", DeathValidateView.as_view(), name="death-validate"),
    path(
        "<uuid:pk>/certificate/",
        DeathCertificatePDFView.as_view(),
        name="death-certificate-pdf",
    ),
    path(
        "<str:certificate_id>/qr-code/", DeathQRCodeView.as_view(), name="death-qr-code"
    ),
    path(
        "<str:certificate_id>/preview/",
        DeathCertificatePreviewView.as_view(),
        name="death-preview",
    ),
]
