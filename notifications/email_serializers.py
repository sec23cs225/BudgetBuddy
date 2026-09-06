from rest_framework import serializers

from .models import NotificationPreference


class NotificationPreferenceSerializer(
    serializers.ModelSerializer
):

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:

        model = NotificationPreference

        fields = [
            "email",
            "email_enabled",
            "budget_alerts",
            "savings_alerts",
            "spending_alerts",
            "security_alerts",
            "important_alerts",
            "updated_at",
        ]

        read_only_fields = [
            "email",
            "updated_at",
        ]