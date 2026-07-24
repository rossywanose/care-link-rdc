# ============================================
# ADMIN REPORTS
# ============================================

from django.contrib import admin
from .models import Report, CitizenReport


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        "report_id",
        "title",
        "report_type",
        "status",
        "hospital",
        "period_start",
        "period_end",
    ]
    list_filter = ["status", "report_type", "created_at", "hospital"]
    search_fields = ["report_id", "title", "hospital__name"]
    ordering = ["-created_at"]


@admin.register(CitizenReport)
class CitizenReportAdmin(admin.ModelAdmin):
    list_display = [
        "report_id",
        "title",
        "report_type",
        "severity",
        "status",
        "submitted_by",
        "created_at",
    ]
    list_filter = ["status", "report_type", "severity", "created_at"]
    search_fields = ["report_id", "title", "description", "submitted_by__email"]
    ordering = ["-created_at"]
    readonly_fields = ["report_id", "created_at", "updated_at", "reviewed_at"]
