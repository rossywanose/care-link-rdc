# ============================
# Admin Notification
# ============================


from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "user",
        "notification_type",
        "priority",
        "is_read",
        "created_at",
    ]
    list_filter = ["notification_type", "priority", "is_read", "created_at"]
    search_fields = ["title", "message", "user__email"]
    ordering = ["-created_at"]


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ["user", "email_new_certificate", "push_validation"]
