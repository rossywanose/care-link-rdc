# ==========================================
# SERIALIZERS PAYMENTS (CORRIGÉ)
# ==========================================

from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    method_display = serializers.CharField(source="get_method_display", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "payment_id",
            "user",
            "user_name",
            "hospital",
            "hospital_name",
            "amount",
            "currency",
            "method",
            "method_display",
            "status",
            "status_display",
            "phone_number",
            "card_last_four",
            "card_brand",
            "transaction_reference",
            "transaction_id",
            "description",
            "created_at",
            "updated_at",
            "paid_at",
        ]
        read_only_fields = [
            "id",
            "payment_id",
            "status",
            "transaction_reference",
            "transaction_id",
            "created_at",
            "updated_at",
            "paid_at",
            "card_last_four",
            "card_brand",
        ]


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement"""

    class Meta:
        model = Payment
        fields = [
            "amount",
            "currency",
            "method",
            "phone_number",
            "description",
        ]

    def validate_amount(self, value):
        """Vérifier que le montant est exactement 1.00"""
        # ✅ CORRIGÉ : Convertir en float pour comparer
        try:
            amount = float(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Le montant doit être un nombre valide.")

        if amount != 1.00:
            raise serializers.ValidationError(
                "Le montant doit être exactement 1.00 USD pour les frais d'ouverture."
            )
        return amount

    def validate(self, attrs):
        """Validation selon la méthode de paiement"""
        method = attrs.get("method")
        phone_number = attrs.get("phone_number")

        if method == "airtel" and not phone_number:
            raise serializers.ValidationError(
                {"phone_number": "Le numéro de téléphone est requis pour Airtel Money."}
            )

        return attrs


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer pour vérifier un paiement"""

    payment_id = serializers.CharField(required=True)
    status = serializers.ChoiceField(
        choices=["success", "failed", "pending"], required=True
    )
    transaction_id = serializers.CharField(required=False, allow_blank=True)


class PaymentHistorySerializer(serializers.ModelSerializer):
    """Serializer léger pour l'historique"""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    method_display = serializers.CharField(source="get_method_display", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "payment_id",
            "amount",
            "currency",
            "method_display",
            "status_display",
            "description",
            "created_at",
            "paid_at",
        ]
