import logging
import threading

from django.db import close_old_connections, transaction
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
# BACKGROUND EMAIL DELIVERY
# ============================================================

def deliver_notification_email(notification_id):
    """
    Sends the notification email in a background thread.

    IMPORTANT:
    This prevents SMTP/SendGrid delays from blocking the
    original API request.
    """

    try:
        # ----------------------------------------------------
        # DATABASE CONNECTION SAFETY
        # ----------------------------------------------------

        close_old_connections()

        # ----------------------------------------------------
        # RELOAD NOTIFICATION INSIDE BACKGROUND THREAD
        # ----------------------------------------------------

        notification = (
            Notification.objects
            .select_related("user")
            .filter(id=notification_id)
            .first()
        )

        if notification is None:
            logger.warning(
                "Notification %s no longer exists. "
                "Email delivery skipped.",
                notification_id,
            )
            return

        # ----------------------------------------------------
        # SEND EMAIL
        # ----------------------------------------------------

        success = send_notification_email(
            notification=notification
        )

        if success:
            logger.info(
                "BudgetBuddy notification email sent "
                "successfully for notification %s.",
                notification_id,
            )

        else:
            logger.info(
                "BudgetBuddy notification email was "
                "not sent for notification %s.",
                notification_id,
            )

    except Exception:
        logger.exception(
            "Unexpected error while sending "
            "BudgetBuddy notification email "
            "for notification %s.",
            notification_id,
        )

    finally:
        # ----------------------------------------------------
        # CLOSE THREAD DATABASE CONNECTION
        # ----------------------------------------------------

        close_old_connections()


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

    Email delivery runs in a background thread so that
    SMTP/SendGrid delays cannot block the API request.

    The in-app notification is created immediately,
    regardless of email delivery status.
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

    notification_id = getattr(
        instance,
        "id",
        None,
    )

    if not notification_id:
        return

    def start_background_email_delivery():
        """
        Start email delivery only after the database
        transaction has successfully committed.
        """

        try:
            email_thread = threading.Thread(
                target=deliver_notification_email,
                args=(notification_id,),
                daemon=True,
                name=(
                    f"budgetbuddy-email-{notification_id}"
                ),
            )

            email_thread.start()

            logger.info(
                "Background email delivery started "
                "for notification %s.",
                notification_id,
            )

        except Exception:
            logger.exception(
                "Unable to start background email "
                "delivery for notification %s.",
                notification_id,
            )

    transaction.on_commit(
        start_background_email_delivery
    )