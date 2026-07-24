# ===============================================
# Urls Reports
# ===============================================

from django.urls import path
from .views import (
    ReportListView,
    ReportDetailView,
    ReportCreateView,
    ReportUpdateView,
    ReportSubmitView,
    ReportReviewView,
    CitizenReportListView,
    CitizenReportCreateView,
    CitizenReportDetailView,
    CitizenReportReviewView,
)

urlpatterns = [
    # ✅ CITIZEN REPORTS D'ABORD (routes spécifiques avant génériques)
    path("citizen/", CitizenReportListView.as_view(), name="citizen-report-list"),
    path(
        "citizen/create/",
        CitizenReportCreateView.as_view(),
        name="citizen-report-create",
    ),
    path(
        "citizen/<uuid:pk>/",
        CitizenReportDetailView.as_view(),
        name="citizen-report-detail",
    ),
    path(
        "citizen/<uuid:pk>/review/",
        CitizenReportReviewView.as_view(),
        name="citizen-report-review",
    ),
    # ✅ HOSPITAL REPORTS APRÈS (routes génériques)
    path("", ReportListView.as_view(), name="report-list"),
    path("create/", ReportCreateView.as_view(), name="report-create"),
    path("<uuid:pk>/", ReportDetailView.as_view(), name="report-detail"),
    path("<uuid:pk>/update/", ReportUpdateView.as_view(), name="report-update"),
    path("<uuid:pk>/submit/", ReportSubmitView.as_view(), name="report-submit"),
    path("<uuid:pk>/review/", ReportReviewView.as_view(), name="report-review"),
]
