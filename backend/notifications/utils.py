from .models import Notification


def create_notification(user, title, message, notification_type):

    # Don't create the same unread notification twice
    existing = Notification.objects.filter(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    ).exists()

    if existing:
        return None

    return Notification.objects.create(
        user=user,
        title=title,
        message=message, 
        notification_type=notification_type,
    )