from django.contrib import admin
from .models import FAQ, Conversation, Message


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = [
        "question_short",
        "role",
        "category",
        "priority",
        "is_active",
        "created_at",
    ]
    list_filter = ["role", "category", "is_active"]
    search_fields = ["question", "answer", "keywords"]
    list_editable = ["priority", "is_active"]

    def question_short(self, obj):
        return obj.question[:60] + "..." if len(obj.question) > 60 else obj.question

    question_short.short_description = "Question"


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "role", "title_short", "message_count", "created_at"]
    list_filter = ["role", "is_active"]
    search_fields = ["user__email", "title"]

    def title_short(self, obj):
        return obj.title[:40] + "..." if len(obj.title) > 40 else obj.title

    title_short.short_description = "Titre"

    def message_count(self, obj):
        return obj.messages.count()

    message_count.short_description = "Messages"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "conversation",
        "sender",
        "source",
        "content_short",
        "created_at",
    ]
    list_filter = ["sender", "source"]
    search_fields = ["content"]

    def content_short(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_short.short_description = "Contenu"
