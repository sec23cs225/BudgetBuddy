from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404

from .models import Expense
from .serializers import ExpenseSerializer

from budgets.models import Budget
from budgets.utils import check_budget_alert
from notifications.utils import create_notification

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def expense_list(request):

    if request.method == "GET":

        expenses = Expense.objects.filter(
            user=request.user
        ).order_by("-expense_date", "-created_at")

        serializer = ExpenseSerializer(expenses, many=True)

        return Response(serializer.data)

    serializer = ExpenseSerializer(data=request.data)

    if serializer.is_valid():

        expense = serializer.save(user=request.user)
        create_notification(
            user=request.user,
            title="Expense Added",
            message=f'Expense "{expense.title}" of ₹{expense.amount} was added under "{expense.category}".',
            notification_type="Expense",
        )
        # Check Budget Alert after creating expense
        try:
            budget = Budget.objects.get(
                user=request.user,
                category=expense.category,
                month=expense.expense_date.month,
                year=expense.expense_date.year,
            )

            check_budget_alert(budget)

        except Budget.DoesNotExist:
            pass

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
def expense_detail(request, pk):

    expense = get_object_or_404(
        Expense,
        pk=pk,
        user=request.user
    )

    if request.method == "GET":

        serializer = ExpenseSerializer(expense)

        return Response(serializer.data)

    if request.method == "PUT":

        serializer = ExpenseSerializer(
            expense,
            data=request.data
        )

        if serializer.is_valid():

            updated_expense = serializer.save(user=request.user)
            create_notification(
                user=request.user,
                title="Expense Updated",
                message=f'Expense "{updated_expense.title}" was updated.',
                notification_type="Expense",
            )
            # Check Budget Alert after updating expense
            try:
                budget = Budget.objects.get(
                    user=request.user,
                    category=updated_expense.category,
                    month=updated_expense.expense_date.month,
                    year=updated_expense.expense_date.year,
                )

                check_budget_alert(budget)

            except Budget.DoesNotExist:
                pass

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Store values before deleting
    category = expense.category
    month = expense.expense_date.month
    year = expense.expense_date.year

    expense_title = expense.title
    expense_amount = expense.amount
    expense_category = expense.category

    expense.delete()

    # Recalculate budget after deletion
    try:
        budget = Budget.objects.get(
            user=request.user,
            category=category,
            month=month,
            year=year,
        )

        check_budget_alert(budget)

    except Budget.DoesNotExist:
        pass
    create_notification(
        user=request.user,
        title="Expense Deleted",
        message=f'Expense "{expense_title}" of ₹{expense_amount} from "{expense_category}" was deleted.',
        notification_type="Expense",
    )
    return Response(
        status=status.HTTP_204_NO_CONTENT
    )