from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin."""

    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'gender', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'matricule']
    ordering = ['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rôle et Profil', {
            'fields': ('role', 'phone', 'avatar', 'hospital')
        }),
        ('Informations Personnelles', {
            'fields': ('date_of_birth', 'gender', 'marital_status', 'nationality')
        }),
        ('Adresse', {
            'fields': ('province', 'commune', 'address')
        }),
        ('Professionnel', {
            'fields': ('matricule', 'grade', 'service', 'direction')
        }),
        ('Paramètres', {
            'fields': ('language', 'theme', 'notifications_enabled', 'last_login_ip')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """AuditLog admin."""

    list_display = ['action', 'user', 'target_type', 'target_id', 'ip_address', 'timestamp']
    list_filter = ['action', 'target_type', 'timestamp']
    search_fields = ['user__email', 'target_id', 'details']
    readonly_fields = ['id', 'timestamp']
    ordering = ['-timestamp']
