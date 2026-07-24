# ==================================
# URLS Configuration de l'application Payments
# ==================================


from django.urls import path
from . import views

urlpatterns = [
    # Liste et détail
    path("", views.PaymentListView.as_view(), name="payment-list"),
    path("<uuid:pk>/", views.PaymentDetailView.as_view(), name="payment-detail"),
    # Frais d'ouverture
    path("opening-fee/", views.create_opening_fee, name="create-opening-fee"),
    path("<uuid:payment_id>/verify/", views.verify_payment, name="verify-payment"),
    path("<uuid:payment_id>/status/", views.get_payment_status, name="payment-status"),
    # Historique
    path("history/", views.get_payment_history, name="payment-history"),
]
