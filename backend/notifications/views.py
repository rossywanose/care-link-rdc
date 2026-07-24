# ====================================================
# Views Notification
# ====================================================


from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer
from users.models import User


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {"notifications": serializer.data, "unread_count": unread_count}
            )
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"notifications": serializer.data, "unread_count": unread_count}
        )


class NotificationMarkReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response({"detail": "Notification marquée comme lue."})


class NotificationMarkAllReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({"detail": "Toutes les notifications marquées comme lues."})


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        prefs, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return prefs


class NotificationDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationUnreadCountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


class SystemNotificationCreateView(generics.GenericAPIView):
    """Publication par les autorités (stats, alertes)"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != "authority":
            return Response(
                {"detail": "Seules les autorités peuvent publier."},
                status=status.HTTP_403_FORBIDDEN,
            )

        title = request.data.get("title")
        message = request.data.get("message")
        priority = request.data.get("priority", "normal")
        target_roles = request.data.get(
            "target_roles", ["citizen", "hospital", "authority"]
        )

        if not title or not message:
            return Response(
                {"detail": "Titre et message requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = User.objects.filter(role__in=target_roles, is_active=True)
        count = 0
        for user in users:
            Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type="system",
                priority=priority,
            )
            count += 1

        return Response(
            {"detail": f"Publication envoyée à {count} utilisateurs.", "count": count},
            status=status.HTTP_201_CREATED,
        )
