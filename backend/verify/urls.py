# =====================================
# Urls Vérification
# =====================================

from django.urls import path
from .views import verify_certificate

urlpatterns = [
    path("<str:certificate_id>/", verify_certificate, name="verify-certificate"),
]
