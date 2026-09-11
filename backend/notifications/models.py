from django.conf import settings
from django.db import models


class Notification(models.Model):

    TYPE_CHOICES = [
        ("Expense", "Expense"),
        ("Income", "Income"),
        ("Budget", "Budget"),
        ("Budget Alert", "Budget Alert"),
        ("Savings Goal", "Savings Goal"),
        ("Reminder", "Reminder"),
        ("System", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    title = models.CharField(
        max_length=150,
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.title


class NotificationPreference(models.Model):
    """
    Stores the authenticated user's preferences for
    BudgetBuddy's email notification system.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )

    # Master email notification switch
    email_enabled = models.BooleanField(
        default=True,
    )

    # Notification categories
    budget_alerts = models.BooleanField(
        default=True,
    )

    savings_alerts = models.BooleanField(
        default=True,
    )

    spending_alerts = models.BooleanField(
        default=True,
    )

    security_alerts = models.BooleanField(
        default=True,
    )

    important_alerts = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "notification_preferences"

    def __str__(self):
        username = getattr(
            self.user,
            "username",
            "User",
        )

        return (
            f"Notification preferences - "
            f"{username}"
        )