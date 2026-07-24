from django.contrib import admin
from .models import DeathCertificate


@admin.register(DeathCertificate)
class DeathCertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_id', 'first_name', 'last_name', 'gender', 'date_of_death', 'status', 'hospital', 'created_at']
    list_filter = ['status', 'gender', 'created_at', 'hospital', 'cause_category']
    search_fields = ['certificate_id', 'first_name', 'last_name', 'declarant_name']
    ordering = ['-created_at']
