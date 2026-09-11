from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


# ============================================================
# LIST / CREATE NOTIFICATIONS
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    GET:
        Returns all notifications belonging to the
        authenticated user.

    POST:
        Creates a notification for the authenticated user.
        The user is automatically assigned from the JWT.
    """

    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    if request.method == "GET":

        notifications = (
            Notification.objects
            .filter(user=request.user)
            .order_by("-created_at")
        )

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # POST
    # --------------------------------------------------------

    serializer = NotificationSerializer(
        data=request.data,
    )

    if serializer.is_valid():

        # IMPORTANT:
        # user is assigned from the authenticated request.
        # This prevents a client from creating a notification
        # for another user.
        serializer.save(
            user=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# ============================================================
# GET / UPDATE / DELETE SINGLE NOTIFICATION
# ============================================================

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def notification_detail(request, pk):
    """
    Handles a single notification belonging to the
    authenticated user.
    """

    notification = get_object_or_404(
        Notification,
        pk=pk,
        user=request.user,
    )

    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    if request.method == "GET":

        serializer = NotificationSerializer(
            notification
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # PUT
    # --------------------------------------------------------

    if request.method == "PUT":

        serializer = NotificationSerializer(
            notification,
            data=request.data,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # DELETE
    # --------------------------------------------------------

    notification.delete()

    return Response(
        status=status.HTTP_204_NO_CONTENT,
    )


# ============================================================
# UNREAD NOTIFICATIONS
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_notifications(request):
    """
    Returns all unread notifications belonging to
    the authenticated user.
    """

    notifications = (
        Notification.objects
        .filter(
            user=request.user,
            is_read=False,
        )
        .order_by("-created_at")
    )

    serializer = NotificationSerializer(
        notifications,
        many=True,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


# ============================================================
# MARK SINGLE NOTIFICATION AS READ
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):
    """
    Marks one notification as read.
    """

    notification = get_object_or_404(
        Notification,
        pk=pk,
        user=request.user,
    )

    notification.is_read = True

    notification.save(
        update_fields=["is_read"]
    )

    serializer = NotificationSerializer(
        notification
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_as_read(request):
    """
    Marks all unread notifications belonging to
    the authenticated user as read.
    """

    updated_count = (
        Notification.objects
        .filter(
            user=request.user,
            is_read=False,
        )
        .update(
            is_read=True
        )
    )

    return Response(
        {
            "message": (
                f"{updated_count} notification(s) "
                "marked as read."
            )
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# CLEAR ALL NOTIFICATIONS
# ============================================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_all_notifications(request):
    """
    Deletes all notifications belonging to the
    authenticated user.
    """

    deleted_count, _ = (
        Notification.objects
        .filter(
            user=request.user
        )
        .delete()
    )

    return Response(
        {
            "message": (
                f"{deleted_count} notification(s) "
                "deleted successfully."
            )
        },
        status=status.HTTP_200_OK,
    )