from django.urls import path

from .email_views import (
    email_preferences,
    test_email_notification,
)


urlpatterns = [
    path(
        "preferences/",
        email_preferences,
        name="email-preferences",
    ),

    path(
        "test/",
        test_email_notification,
        name="test-email-notification",
    ),
]