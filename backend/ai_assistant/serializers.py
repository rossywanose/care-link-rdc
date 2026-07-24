from rest_framework import serializers
from .models import FAQ, Conversation, Message


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = [
            "id",
            "question",
            "answer",
            "role",
            "category",
            "keywords",
            "priority",
        ]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "sender", "content", "source", "created_at"]
        read_only_fields = ["id", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "role",
            "context_data",
            "messages",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ChatRequestSerializer(serializers.Serializer):
    """Serializer pour la requête de chat"""

    message = serializers.CharField(required=True, help_text="Message de l'utilisateur")
    conversation_id = serializers.IntegerField(
        required=False, allow_null=True, help_text="ID conversation existante"
    )
    context_data = serializers.JSONField(
        required=False, default=dict, help_text="Données contextuelles"
    )


class ChatResponseSerializer(serializers.Serializer):
    """Serializer pour la réponse de chat"""

    message = serializers.CharField()
    source = serializers.CharField()
    conversation_id = serializers.IntegerField()
    faq_matched = serializers.BooleanField(default=False)
