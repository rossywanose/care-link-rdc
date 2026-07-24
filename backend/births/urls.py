from django.urls import path
from .views import (
    BirthListView,
    BirthDetailView,
    BirthCreateView,
    BirthUpdateView,
    BirthValidateView,
    BirthStatsView,
    BirthCertificatePDFView,
    BirthQRCodeView,
    BirthCertificatePreviewView,
)

urlpatterns = [
    path("", BirthListView.as_view(), name="birth-list"),
    path("stats/", BirthStatsView.as_view(), name="birth-stats"),
    path("create/", BirthCreateView.as_view(), name="birth-create"),
    path("<uuid:pk>/", BirthDetailView.as_view(), name="birth-detail"),
    path("<uuid:pk>/update/", BirthUpdateView.as_view(), name="birth-update"),
    path("<uuid:pk>/validate/", BirthValidateView.as_view(), name="birth-validate"),
    path(
        "<uuid:pk>/certificate/",
        BirthCertificatePDFView.as_view(),
        name="birth-certificate-pdf",
    ),
    path(
        "<str:certificate_id>/qr-code/", BirthQRCodeView.as_view(), name="birth-qr-code"
    ),
    path(
        "<str:certificate_id>/preview/",
        BirthCertificatePreviewView.as_view(),
        name="birth-preview",
    ),
]
