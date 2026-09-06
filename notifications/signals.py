import logging

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .email_service import send_notification_email
from .models import (
    Notification,
    NotificationPreference,
)


logger = logging.getLogger(__name__)


# ============================================================
# NOTIFICATION TYPE → EMAIL PREFERENCE MAPPING
# ============================================================

NOTIFICATION_PREFERENCE_MAP = {
    "Expense": "spending_alerts",
    "Income": "important_alerts",
    "Budget": "budget_alerts",
    "Budget Alert": "budget_alerts",
    "Savings Goal": "savings_alerts",
    "Reminder": "important_alerts",
    "System": "important_alerts",
}


# ============================================================
# EMAIL PREFERENCE CHECK
# ============================================================

def should_send_email(notification):
    """
    Determines whether an email should be sent for a
    notification according to the user's preferences.
    """

    user_id = getattr(
        notification,
        "user_id",
        None,
    )

    if not user_id:
        return False

    try:
        preferences = (
            NotificationPreference.objects.filter(
                user_id=user_id
            ).first()
        )

        if preferences is None:
            preferences = (
                NotificationPreference.objects.create(
                    user_id=user_id
                )
            )

    except Exception:
        logger.exception(
            "Unable to retrieve or create email "
            "preferences for user %s.",
            user_id,
        )
        return False

    # --------------------------------------------------------
    # MASTER EMAIL SWITCH
    # --------------------------------------------------------

    if not preferences.email_enabled:
        return False

    # --------------------------------------------------------
    # NOTIFICATION TYPE
    # --------------------------------------------------------

    notification_type = (
        getattr(
            notification,
            "notification_type",
            "",
        )
        or ""
    ).strip()

    preference_field = (
        NOTIFICATION_PREFERENCE_MAP.get(
            notification_type
        )
    )

    # Unknown notification types are treated as
    # important notifications.
    if preference_field is None:
        preference_field = "important_alerts"

    return bool(
        getattr(
            preferences,
            preference_field,
            True,
        )
    )


# ============================================================
# NOTIFICATION CREATED → EMAIL
# ============================================================

@receiver(
    post_save,
    sender=Notification,
    dispatch_uid="budgetbuddy_notification_email",
)
def send_notification_email_on_create(
    sender,
    instance,
    created,
    **kwargs,
):
    """
    Sends an email when a new BudgetBuddy notification
    is created.

    Email delivery is isolated from notification creation.
    If email delivery fails, the notification itself
    remains unaffected.
    """

    # --------------------------------------------------------
    # ONLY NEW NOTIFICATIONS
    # --------------------------------------------------------

    if not created:
        return

    # --------------------------------------------------------
    # USER CHECK
    # --------------------------------------------------------

    if not getattr(
        instance,
        "user_id",
        None,
    ):
        return

    # --------------------------------------------------------
    # PREFERENCE CHECK
    # --------------------------------------------------------

    try:
        if not should_send_email(instance):
            logger.info(
                "Email skipped for notification %s "
                "because of user email preferences.",
                getattr(
                    instance,
                    "id",
                    "unknown",
                ),
            )
            return

    except Exception:
        logger.exception(
            "Unexpected error while checking email "
            "preferences for notification %s.",
            getattr(
                instance,
                "id",
                "unknown",
            ),
        )
        return

    # --------------------------------------------------------
    # SEND EMAIL AFTER DATABASE COMMIT
    # --------------------------------------------------------

    def deliver_email():
        try:
            success = send_notification_email(
                notification=instance
            )

            if success:
                logger.info(
                    "BudgetBuddy notification email sent "
                    "successfully for notification %s.",
                    getattr(
                        instance,
                        "id",
                        "unknown",
                    ),
                )

            else:
                logger.info(
                    "BudgetBuddy notification email was "
                    "not sent for notification %s.",
                    getattr(
                        instance,
                        "id",
                        "unknown",
                    ),
                )

        except Exception:
            logger.exception(
                "Unexpected error while sending "
                "BudgetBuddy notification email "
                "for notification %s.",
                getattr(
                    instance,
                    "id",
                    "unknown",
                ),
            )

    transaction.on_commit(
        deliver_email
    )