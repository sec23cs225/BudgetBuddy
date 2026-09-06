from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import ExtractMonth

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from expenses.models import Expense
from income.models import Income
from savings.models import SavingsGoal
from budgets.models import Budget
from .utils import (get_budget_performance,
                    get_expense_statistics,
                    get_recent_transactions,
                    get_latest_notifications,
                    get_active_savings_goals )
from expenses.models import Expense
from expenses.serializers import ExpenseSerializer

from savings.models import SavingsGoal
from savings.serializers import (
    SavingsGoalSerializer,
    SavingsProgressSerializer,
)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    budget_performance = get_budget_performance(request.user)
    expense_statistics = get_expense_statistics(request.user)
    recent_transactions = get_recent_transactions(request.user)
    latest_notifications = get_latest_notifications(request.user)
    active_savings_goals = get_active_savings_goals(request.user)  

    total_income = (
        Income.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )

    total_expenses = (
        Expense.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )

    total_saved = (
        SavingsGoal.objects.filter(user=request.user)
        .aggregate(total=Sum("saved_amount"))
        .get("total")
        or Decimal("0.00")
    )

    balance = total_income - total_expenses
    summary = {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_saved": total_saved,
        "balance": balance,
    }
    category_breakdown = (
        Expense.objects.filter(user=request.user)
        .values("category")
        .annotate(total_amount=Sum("amount"))
        .order_by("-total_amount")
    )
    monthly_trend = (
        Expense.objects.filter(user=request.user)
        .annotate(month=ExtractMonth("expense_date"))
        .values("month")
        .annotate(total_amount=Sum("amount"))
        .order_by("month")
    )
    income_vs_expense = {
        "total_income": total_income,
        "total_expenses": total_expenses,
    }
    # Recent Expenses
    recent_expenses = Expense.objects.filter(
        user=request.user
    ).order_by("-expense_date")[:5]

    recent_expenses_data = ExpenseSerializer(
        recent_expenses,
        many=True
    ).data


    # Active Savings Goals
    active_savings = SavingsGoal.objects.filter(
        user=request.user
    )

    active_savings_data = SavingsProgressSerializer(
        active_savings,
        many=True
    ).data
    return Response({
        "summary": summary,
        "category_breakdown": category_breakdown,
        "monthly_trend": monthly_trend,
        "income_vs_expense": income_vs_expense,
        "budget_performance": budget_performance,
        "recent_expenses": recent_expenses_data,
        "active_savings_goals": active_savings_data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def category_breakdown(request):

    data = (
        Expense.objects.filter(user=request.user)
        .values("category")
        .annotate(total_amount=Sum("amount"))
        .order_by("-total_amount")
    )

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_expense_trend(request):

    data = (
        Expense.objects.filter(user=request.user)
        .annotate(month=ExtractMonth("expense_date"))
        .values("month")
        .annotate(total_amount=Sum("amount"))
        .order_by("month")
    )

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def income_vs_expense(request):

    total_income = (
        Income.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )

    total_expenses = (
        Expense.objects.filter(user=request.user)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )

    return Response({
        "total_income": total_income,
        "total_expenses": total_expenses,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_performance(request):

    budgets = Budget.objects.filter(user=request.user)

    report = []

    for budget in budgets:

        spent = (
            Expense.objects.filter(
                user=request.user,
                category=budget.category,
                expense_date__month=budget.month,
                expense_date__year=budget.year,
            )
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0.00")
        )

        remaining = budget.budget_amount - spent

        if budget.budget_amount > 0:
            utilization = round(
                (spent / budget.budget_amount) * 100,
                2,
            )
        else:
            utilization = 0

        report.append({
            "category": budget.category,
            "month": budget.month,
            "year": budget.year,
            "budget": budget.budget_amount,
            "spent": spent,
            "remaining": remaining,
            "utilization_percentage": utilization,
        })
    return Response(get_budget_performance(request.user))
