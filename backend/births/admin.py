from django.contrib import admin
from .models import BirthCertificate


@admin.register(BirthCertificate)
class BirthCertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_id', 'child_first_name', 'child_last_name', 'gender', 'status', 'hospital', 'created_at']
    list_filter = ['status', 'gender', 'created_at', 'hospital']
    search_fields = ['certificate_id', 'child_first_name', 'child_last_name', 'father_first_name', 'mother_first_name']
    ordering = ['-created_at']
