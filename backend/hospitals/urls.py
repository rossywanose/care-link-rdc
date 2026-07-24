# ==========================================
# URLS HOPITALS (CORRIGÉ — avec imports)
# ==========================================

from django.urls import path
from .views import (
    HospitalListView,
    HospitalDetailView,
    HospitalCreateView,
    HospitalUpdateView,
    HospitalStatsView,
    upload_hospital_logo,
    activate_hospital_payment,  # ← AJOUTÉ
    check_hospital_status,  # ← AJOUTÉ
)

urlpatterns = [
    path("", HospitalListView.as_view(), name="hospital-list"),
    path("create/", HospitalCreateView.as_view(), name="hospital-create"),
    path("<uuid:pk>/", HospitalDetailView.as_view(), name="hospital-detail"),
    path("<uuid:pk>/update/", HospitalUpdateView.as_view(), name="hospital-update"),
    path("<uuid:pk>/stats/", HospitalStatsView.as_view(), name="hospital-stats"),
    path("<uuid:pk>/upload-logo/", upload_hospital_logo, name="hospital-upload-logo"),
    # ✅ CORRIGÉ : Nouveaux endpoints (sans l'ancien subscription/check)
    path("activate-payment/", activate_hospital_payment, name="activate-payment"),
    path("status/check/", check_hospital_status, name="check-status"),
]
