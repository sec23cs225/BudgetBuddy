from django.urls import include, path

from .views import (
    notification_list,
    notification_detail,
    unread_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    clear_all_notifications,
)


urlpatterns = [
    # ========================================================
    # EXISTING NOTIFICATION ROUTES
    # ========================================================

    path(
        "",
        notification_list,
        name="notification-list",
    ),

    path(
        "unread/",
        unread_notifications,
        name="unread-notifications",
    ),

    path(
        "read-all/",
        mark_all_notifications_as_read,
        name="mark-all-notifications-read",
    ),

    path(
        "<int:pk>/read/",
        mark_notification_as_read,
        name="mark-notification-read",
    ),

    path(
        "clear/",
        clear_all_notifications,
        name="clear-all-notifications",
    ),

    path(
        "<int:pk>/",
        notification_detail,
        name="notification-detail",
    ),

    # ========================================================
    # EMAIL NOTIFICATION ROUTES
    # ========================================================

    path(
        "email/",
        include("notifications.email_urls"),
    ),
]