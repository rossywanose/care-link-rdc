# users/urls.py
# =================================================
# URLs Users (CORRIGÉ — avec vérification matricule)
# =================================================

from django.urls import path
from . import views
from . import password_reset_views  # IMPORTER LE NOUVEAU FICHIER

urlpatterns = [
    # Auth existant
    path("register/", views.RegisterView.as_view(), name="register"),
    path(
        "register-authority/",
        views.AuthorityRegisterView.as_view(),
        name="register-authority",
    ),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "verify-matricule/", views.verify_authority_matricule, name="verify-matricule"
    ),
    # Profile existant
    path("profile/", views.UserProfileView.as_view(), name="profile"),
    path(
        "password-change/", views.PasswordChangeView.as_view(), name="password-change"
    ),
    # Users list/detail existant
    path("", views.UserListView.as_view(), name="user-list"),
    path("<uuid:pk>/", views.UserDetailView.as_view(), name="user-detail"),
    # Audit logs existant
    path("audit-logs/", views.AuditLogListView.as_view(), name="audit-logs"),
    # ============================================================
    # NOUVEAU : Password Reset
    # ============================================================
    path(
        "password-reset-request/",
        password_reset_views.PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "password-reset-verify/",
        password_reset_views.PasswordResetVerifyCodeView.as_view(),
        name="password-reset-verify",
    ),
    path(
        "password-reset-confirm/",
        password_reset_views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
]
