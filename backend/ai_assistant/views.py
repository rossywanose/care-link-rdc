# ================================
# Views Ai-Assistant
# ================================

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import FAQ, Conversation, Message
from .serializers import (
    ChatRequestSerializer,
    ChatResponseSerializer,
    ConversationSerializer,
)
from .utils.groq_client import groq_client
from .utils.rag_engine import rag_engine
from .utils.role_context import role_context_builder


def _get_user_display_name(user):
    """Récupère le prénom de l'utilisateur pour personnaliser les réponses"""
    if hasattr(user, "first_name") and user.first_name:
        return user.first_name
    if hasattr(user, "email") and user.email:
        return user.email.split("@")[0]
    return "Utilisateur"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    Endpoint principal de chat avec l'AI

    POST /api/v1/ai/chat/
    {
        "message": "Comment enregistrer une naissance ?",
        "conversation_id": null,  // ou ID existant
        "context_data": {}  // données additionnelles
    }
    """
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user
    user_role = getattr(user, "role", "citizen")
    user_name = _get_user_display_name(user)

    # Récupérer ou créer la conversation
    conversation_id = data.get("conversation_id")
    if conversation_id:
        conversation = get_object_or_404(Conversation, id=conversation_id, user=user)
    else:
        # Créer une nouvelle conversation
        context_data = role_context_builder.build_context(user, user_role)
        conversation = Conversation.objects.create(
            user=user,
            role=user_role,
            title=data["message"][:50],
            context_data=context_data,
        )

    # Sauvegarder le message utilisateur
    Message.objects.create(
        conversation=conversation, sender="user", content=data["message"]
    )

    # ============================================================
    # ÉTAPE 1: Rechercher dans les suggestions prédéfinies (RAG)
    # ============================================================
    rag_result = rag_engine.get_best_answer(data["message"], user_role)

    if rag_result["found"]:
        # ✅ Réponse trouvée dans les suggestions → remplacer {{name}}
        ai_response = rag_result["answer"].replace("{{name}}", user_name)
        source = "faq"
        faq_ref = rag_result["faq"]
    else:
        # ============================================================
        # ÉTAPE 2: Aucune FAQ trouvée → Appel GROQ_API_KEY
        # ============================================================
        context = conversation.context_data
        system_prompt = role_context_builder.build_system_prompt(context)

        # Construire l'historique des messages
        messages = [{"role": "system", "content": system_prompt}]

        # Ajouter l'historique de la conversation (limité aux 10 derniers messages)
        history = conversation.messages.order_by("created_at")[:10]
        for msg in history:
            role = "user" if msg.sender == "user" else "assistant"
            messages.append({"role": role, "content": msg.content})

        # Appeler Groq
        groq_result = groq_client.chat(messages)

        if groq_result["success"]:
            ai_response = groq_result["content"]
            source = "groq"
            faq_ref = None
        else:
            # Fallback si Groq échoue
            ai_response = (
                "Désolé " + user_name + ", je rencontre un problème technique. "
                "Veuillez réessayer dans un moment."
            )
            source = "error"
            faq_ref = None

    # Sauvegarder la réponse AI
    ai_message = Message.objects.create(
        conversation=conversation,
        sender="ai",
        content=ai_response,
        source=source,
        faq_reference=faq_ref,
        metadata={
            "tokens_used": (
                groq_result.get("tokens_used", 0) if not rag_result["found"] else 0
            ),
            "model": (
                groq_result.get("model", "faq") if not rag_result["found"] else "faq"
            ),
        },
    )

    # Mettre à jour la conversation
    conversation.save()  # Met à jour updated_at

    return Response(
        {
            "message": ai_response,
            "source": source,
            "conversation_id": conversation.id,
            "faq_matched": rag_result["found"],
            "created_at": ai_message.created_at,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def conversations(request):
    """
    Lister les conversations de l'utilisateur
    GET /api/v1/ai/conversations/
    """
    user_conversations = Conversation.objects.filter(
        user=request.user, is_active=True
    ).order_by("-updated_at")

    serializer = ConversationSerializer(user_conversations, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def conversation_detail(request, pk):
    """
    Détails d'une conversation
    GET /api/v1/ai/conversations/<id>/
    """
    conversation = get_object_or_404(Conversation, pk=pk, user=request.user)
    serializer = ConversationSerializer(conversation)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_conversation(request, pk):
    """
    Supprimer une conversation (soft delete)
    DELETE /api/v1/ai/conversations/<id>/
    """
    conversation = get_object_or_404(Conversation, pk=pk, user=request.user)
    conversation.is_active = False
    conversation.save()
    return Response({"message": "Conversation supprimée"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def suggestions(request):
    """
    Suggestions de questions pour l'utilisateur
    GET /api/v1/ai/suggestions/?role=citizen
    """
    role = request.query_params.get("role", "all")
    limit = int(request.query_params.get("limit", 5))

    faqs = FAQ.objects.filter(role__in=[role, "all"], is_active=True).order_by(
        "-priority"
    )[:limit]

    suggestions = []
    for faq in faqs:
        suggestions.append(
            {"question": faq.question, "category": faq.category, "id": faq.id}
        )

    return Response({"suggestions": suggestions})
