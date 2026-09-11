from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

from notifications.utils import create_notification


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def savings_list(request):

    if request.method == "GET":

        goals = SavingsGoal.objects.filter(
            user=request.user
        )

        serializer = SavingsGoalSerializer(
            goals,
            many=True
        )

        return Response(serializer.data)

    serializer = SavingsGoalSerializer(
        data=request.data
    )

    if serializer.is_valid():

        goal = serializer.save(
            user=request.user
        )
        # Savings Goal Created
        create_notification(
            user=request.user,
            title="Savings Goal Created",
            message=(
                f'Savings goal "{goal.goal_name}" '
                f'with a target of ₹{goal.target_amount} was created.'
            ),
            notification_type="Savings Goal",
        )

        # Savings Goal Completed
        if goal.status == "Completed":

            create_notification(
                user=request.user,
                title="Savings Goal Completed",
                message=(
                    f'Congratulations! '
                    f'You have completed your '
                    f'"{goal.goal_name}" savings goal.'
                ),
                notification_type="Savings Goal",
            )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def savings_detail(request, pk):

    try:

        goal = SavingsGoal.objects.get(
            pk=pk,
            user=request.user
        )

    except SavingsGoal.DoesNotExist:

        return Response(
            {"error": "Savings Goal not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":

        serializer = SavingsGoalSerializer(goal)

        return Response(serializer.data)

    if request.method == "PUT":

        previous_status = goal.status

        serializer = SavingsGoalSerializer(
            goal,
            data=request.data
        )
        if serializer.is_valid():

            updated_goal = serializer.save()

            # Savings Goal Updated
            create_notification(
                user=request.user,
                title="Savings Goal Updated",
                message=(
                    f'Savings goal '
                    f'"{updated_goal.goal_name}" '
                    f'was updated.'
                ),
                notification_type="Savings Goal",
            )

            # Savings Goal Completed
            if (
                previous_status == "In Progress"
                and updated_goal.status == "Completed"
            ):

                create_notification(
                    user=request.user,
                    title="Savings Goal Completed",
                    message=(
                        f'Congratulations! '
                        f'You have completed your '
                        f'"{updated_goal.goal_name}" savings goal.'
                    ),
                    notification_type="Savings Goal",
                )

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Store values before deleting

    goal_name = goal.goal_name
    target_amount = goal.target_amount

    goal.delete()

    create_notification(
        user=request.user,
        title="Savings Goal Deleted",
        message=(
            f'Savings goal "{goal_name}" '
            f'with target ₹{target_amount} '
            f'was deleted.'
        ),
        notification_type="Savings Goal",
    )

    return Response(
        status=status.HTTP_204_NO_CONTENT
    )