"""
Care-Link RDC URL Configuration
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from users.views import LoginView
from verify.views import verify_certificate

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # JWT Authentication
    path("api/v1/auth/login/", LoginView.as_view(), name="login"),
    path("api/v1/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/auth/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # API Endpoints
    path("api/v1/users/", include("users.urls")),
    path("api/v1/hospitals/", include("hospitals.urls")),
    path("api/v1/births/", include("births.urls")),
    path("api/v1/deaths/", include("deaths.urls")),
    path("api/v1/payments/", include("payments.urls")),
    path("api/v1/reports/", include("reports.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/ai/", include("ai_assistant.urls")),
    path("api/v1/publications/", include("publications.urls")),
    path(
        "api/v1/verify/<str:certificate_id>/",
        verify_certificate,
        name="verify-certificate",
    ),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: si l'URL ne correspond à rien ci-dessus, renvoie index.html (React)
# Cela permet à React Router de gérer les routes côté client
urlpatterns += [
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]
