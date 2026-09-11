from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Budget
from .serializers import BudgetSerializer

from notifications.utils import create_notification


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def budget_list(request):

    if request.method == "GET":

        budgets = Budget.objects.filter(
            user=request.user
        ).order_by("-year", "-month")

        serializer = BudgetSerializer(
            budgets,
            many=True
        )

        return Response(serializer.data)

    serializer = BudgetSerializer(
        data=request.data
    )

    if serializer.is_valid():

        budget = serializer.save(
            user=request.user
        )
        create_notification(
            user=request.user,
            title="Budget Created",
            message=(
                f'Budget for "{budget.category}" was set to '
                f'₹{budget.budget_amount} '
                f'for {budget.month}/{budget.year}.'
            ),
            notification_type="Budget",
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
def budget_detail(request, pk):

    budget = get_object_or_404(
        Budget,
        pk=pk,
        user=request.user
    )

    if request.method == "GET":

        serializer = BudgetSerializer(
            budget
        )

        return Response(serializer.data)

    if request.method == "PUT":

        serializer = BudgetSerializer(
            budget,
            data=request.data
        )

        if serializer.is_valid():

            updated_budget = serializer.save(
                user=request.user
            )
            create_notification(
                user=request.user,
                title="Budget Updated",
                message=(
                    f'Budget for "{updated_budget.category}" '
                    f'was updated to ₹{updated_budget.budget_amount} '
                    f'for {updated_budget.month}/{updated_budget.year}.'
                ),
                notification_type="Budget",
            )

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Store details before deleting
    budget_category = budget.category
    budget_amount = budget.budget_amount
    budget_month = budget.month
    budget_year = budget.year

    budget.delete()
    create_notification(
        user=request.user,
        title="Budget Deleted",
        message=(
            f'Budget for "{budget_category}" '
            f'of ₹{budget_amount} '
            f'for {budget_month}/{budget_year} was deleted.'
        ),
        notification_type="Budget",
    )

    return Response(
        status=status.HTTP_204_NO_CONTENT
    )