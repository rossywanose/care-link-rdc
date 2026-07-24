# ==================================
# Urls Ai-Assistant
# ==================================

from django.urls import path
from . import views

urlpatterns = [
    # Chat principal
    path("chat/", views.chat, name="ai-chat"),
    # Conversations
    path("conversations/", views.conversations, name="ai-conversations"),
    path(
        "conversations/<int:pk>/",
        views.conversation_detail,
        name="ai-conversation-detail",
    ),
    path(
        "conversations/<int:pk>/delete/",
        views.delete_conversation,
        name="ai-conversation-delete",
    ),
    # Suggestions
    path("suggestions/", views.suggestions, name="ai-suggestions"),
]
