# ==============================
# Urls Notification
# ==============================


from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationPreferenceView,
    NotificationDeleteView,
    NotificationUnreadCountView,
    SystemNotificationCreateView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path(
        "mark-all-read/",
        NotificationMarkAllReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path(
        "<uuid:pk>/read/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "<uuid:pk>/delete/",
        NotificationDeleteView.as_view(),
        name="notification-delete",
    ),
    path(
        "unread-count/",
        NotificationUnreadCountView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "preferences/",
        NotificationPreferenceView.as_view(),
        name="notification-preferences",
    ),
    path("system/", SystemNotificationCreateView.as_view(), name="notification-system"),
]
