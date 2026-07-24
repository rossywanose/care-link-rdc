# ==========================================
# ADMIN PAYMENTS
# ==========================================

from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "payment_id",
        "user",
        "hospital",
        "amount",
        "currency",
        "method",
        "status",
        "created_at",
        "paid_at",
    ]
    list_filter = ["status", "method", "currency", "created_at"]
    search_fields = ["payment_id", "user__email", "hospital__name", "transaction_id"]
    readonly_fields = [
        "id",
        "payment_id",
        "created_at",
        "updated_at",
        "paid_at",
        "transaction_reference",
        "transaction_id",
    ]
    date_hierarchy = "created_at"
