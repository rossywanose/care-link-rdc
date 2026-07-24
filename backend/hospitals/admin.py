from django.contrib import admin
from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'hospital_id', 'hospital_type', 'province', 'status', 'created_at']
    list_filter = ['hospital_type', 'status', 'province', 'created_at']
    search_fields = ['name', 'hospital_id', 'director_name']
    ordering = ['name']
