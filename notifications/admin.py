from django.contrib import admin

from .models import (
    Notification,
    NotificationPreference,
)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "user",
        "notification_type",
        "is_read",
        "created_at",
    )

    list_filter = (
        "notification_type",
        "is_read",
        "created_at",
    )

    search_fields = (
        "title",
        "message",
        "user__username",
        "user__email",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "-created_at",
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "email_enabled",
        "budget_alerts",
        "savings_alerts",
        "spending_alerts",
        "security_alerts",
        "important_alerts",
        "updated_at",
    )

    list_filter = (
        "email_enabled",
        "budget_alerts",
        "savings_alerts",
        "spending_alerts",
        "security_alerts",
        "important_alerts",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-updated_at",
    )