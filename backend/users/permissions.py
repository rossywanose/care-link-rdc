from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access only to the owner or admin."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.is_staff or request.user.role == 'admin'


class IsCitizen(permissions.BasePermission):
    """Allow access only to citizens."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'citizen'


class IsHospital(permissions.BasePermission):
    """Allow access only to hospital staff."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'hospital'


class IsAuthorityOrAdmin(permissions.BasePermission):
    """Allow access only to authority or admin users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'authority' or 
            request.user.role == 'admin' or
            request.user.is_staff
        )


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_staff
        )
