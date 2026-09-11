from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.urls import reverse

from rest_framework.test import APIClient

from .models import (
    Notification,
    NotificationPreference,
)


User = get_user_model()


class NotificationEmailTests(TestCase):
    """
    Tests for BudgetBuddy's email notification system.
    """

    def setUp(self):

        self.user = User.objects.create_user(
            username="budgetbuddy_test",
            email="test@example.com",
            password="TestPassword123!",
        )

        self.client = APIClient()

        self.client.force_authenticate(
            user=self.user
        )

        self.preferences = (
            NotificationPreference.objects.create(
                user=self.user
            )
        )


    # ========================================================
    # EMAIL PREFERENCES
    # ========================================================

    def test_get_email_preferences(self):

        response = self.client.get(
            reverse(
                "email-preferences"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["email"],
            "test@example.com",
        )

        self.assertTrue(
            response.data["email_enabled"]
        )


    def test_update_email_preferences(self):

        response = self.client.patch(
            reverse(
                "email-preferences"
            ),
            {
                "email_enabled": False,
                "budget_alerts": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.preferences.refresh_from_db()

        self.assertFalse(
            self.preferences.email_enabled
        )

        self.assertFalse(
            self.preferences.budget_alerts
        )


    def test_invalid_email_preference_is_rejected(self):

        response = self.client.patch(
            reverse(
                "email-preferences"
            ),
            {
                "budget_alerts": "not-a-boolean",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )


    # ========================================================
    # TEST EMAIL
    # ========================================================

    def test_test_email_is_sent(self):

        response = self.client.post(
            reverse(
                "test-email-notification"
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(mail.outbox),
            1,
        )

        email = mail.outbox[0]

        self.assertEqual(
            email.to,
            ["test@example.com"],
        )

        self.assertIn(
            "BudgetBuddy",
            email.subject,
        )


    def test_test_email_fails_without_user_email(self):

        self.user.email = ""
        self.user.save()

        response = self.client.post(
            reverse(
                "test-email-notification"
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            len(mail.outbox),
            0,
        )


    # ========================================================
    # AUTOMATIC NOTIFICATION EMAIL
    # ========================================================

    def test_budget_notification_sends_email(self):

        Notification.objects.create(
            user=self.user,
            title="Budget threshold reached",
            message=(
                "Your monthly food budget has "
                "reached 80% of its limit."
            ),
            notification_type="Budget Alert",
        )

        self.assertEqual(
            len(mail.outbox),
            1,
        )

        email = mail.outbox[0]

        self.assertEqual(
            email.to,
            ["test@example.com"],
        )

        self.assertIn(
            "Budget threshold reached",
            email.subject,
        )


    def test_email_is_not_sent_when_email_disabled(self):

        self.preferences.email_enabled = False

        self.preferences.save()

        Notification.objects.create(
            user=self.user,
            title="Budget threshold reached",
            message=(
                "Your monthly budget has "
                "reached its alert threshold."
            ),
            notification_type="Budget Alert",
        )

        self.assertEqual(
            len(mail.outbox),
            0,
        )


    def test_budget_email_can_be_disabled_individually(self):

        self.preferences.budget_alerts = False

        self.preferences.save()

        Notification.objects.create(
            user=self.user,
            title="Budget threshold reached",
            message=(
                "Your monthly budget has "
                "reached its alert threshold."
            ),
            notification_type="Budget Alert",
        )

        self.assertEqual(
            len(mail.outbox),
            0,
        )


    def test_savings_email_is_sent_when_enabled(self):

        Notification.objects.create(
            user=self.user,
            title="Savings milestone achieved",
            message=(
                "You have reached 75% of your "
                "savings goal."
            ),
            notification_type="Savings Goal",
        )

        self.assertEqual(
            len(mail.outbox),
            1,
        )

        self.assertEqual(
            mail.outbox[0].to,
            ["test@example.com"],
        )


    def test_expense_email_uses_spending_preference(self):

        Notification.objects.create(
            user=self.user,
            title="Spending update",
            message=(
                "Your spending has increased "
                "compared with the previous period."
            ),
            notification_type="Expense",
        )

        self.assertEqual(
            len(mail.outbox),
            1,
        )


    # ========================================================
    # HTML EMAIL
    # ========================================================

    def test_notification_email_contains_html_content(self):

        Notification.objects.create(
            user=self.user,
            title="Budget update",
            message="Your budget requires attention.",
            notification_type="Budget",
        )

        self.assertEqual(
            len(mail.outbox),
            1,
        )

        email = mail.outbox[0]

        self.assertTrue(
            email.alternatives
        )

        html_content = (
            email.alternatives[0][0]
        )

        self.assertIn(
            "BUDGETBUDDY",
            html_content,
        )

        self.assertIn(
            "Budget update",
            html_content,
        )


    # ========================================================
    # AUTHENTICATION
    # ========================================================

    def test_preferences_require_authentication(self):

        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            reverse(
                "email-preferences"
            )
        )

        self.assertIn(
            response.status_code,
            [401, 403],
        )


    def test_test_email_requires_authentication(self):

        self.client.force_authenticate(
            user=None
        )

        response = self.client.post(
            reverse(
                "test-email-notification"
            ),
            {},
            format="json",
        )

        self.assertIn(
            response.status_code,
            [401, 403],
        )