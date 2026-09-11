from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .email_serializers import (
    NotificationPreferenceSerializer,
)
from .email_service import send_test_email
from .models import NotificationPreference


# ============================================================
# EMAIL PREFERENCES
# ============================================================

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def email_preferences(request):
    """
    GET:
        Returns the authenticated user's email preferences.

    PATCH:
        Updates only the email preference fields supplied
        by the authenticated user.
    """

    preferences, _ = (
        NotificationPreference.objects.get_or_create(
            user=request.user
        )
    )

    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    if request.method == "GET":

        serializer = NotificationPreferenceSerializer(
            preferences
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # PATCH
    # --------------------------------------------------------

    serializer = NotificationPreferenceSerializer(
        preferences,
        data=request.data,
        partial=True,
    )

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer.save()

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


# ============================================================
# TEST EMAIL
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def test_email_notification(request):
    """
    Sends a test email to the authenticated user's
    registered email address.

    The recipient cannot be supplied by the frontend.
    """

    user = request.user

    email_address = (
        getattr(
            user,
            "email",
            "",
        )
        or ""
    ).strip()

    # --------------------------------------------------------
    # USER EMAIL CHECK
    # --------------------------------------------------------

    if not email_address:

        return Response(
            {
                "detail": (
                    "No email address is associated "
                    "with your BudgetBuddy account."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # SEND TEST EMAIL
    # --------------------------------------------------------

    try:

        send_test_email(user)

        return Response(
            {
                "detail": (
                    "Test email sent successfully."
                ),
                "email": email_address,
            },
            status=status.HTTP_200_OK,
        )

    except ValueError as error:

        return Response(
            {
                "detail": str(error),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception:

        return Response(
            {
                "detail": (
                    "The test email could not be sent. "
                    "Please check the SMTP configuration "
                    "and try again."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )