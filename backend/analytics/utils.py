from decimal import Decimal
from django.db.models import Sum

from budgets.models import Budget
from expenses.models import Expense
from income.models import Income
from notifications.models import Notification
from savings.models import SavingsGoal

def get_budget_performance(user):

    budgets = Budget.objects.filter(user=user)

    report = []

    for budget in budgets:

        spent = (
            Expense.objects.filter(
                user=user,
                category=budget.category,
                expense_date__month=budget.month,
                expense_date__year=budget.year,
            )
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0.00")
        )

        remaining = budget.budget_amount - spent

        utilization = (
            round((spent / budget.budget_amount) * 100, 2)
            if budget.budget_amount > 0
            else 0
        )

        report.append({
            "category": budget.category,
            "month": budget.month,
            "year": budget.year,
            "budget": budget.budget_amount,
            "spent": spent,
            "remaining": remaining,
            "utilization_percentage": utilization,
        })

    return report


def get_expense_statistics(user):

    highest_expense = (
        Expense.objects.filter(user=user)
        .order_by("-amount")
        .first()
    )

    lowest_expense = (
        Expense.objects.filter(user=user)
        .order_by("amount")
        .first()
    )

    latest_expense = (
        Expense.objects.filter(user=user)
        .order_by("-expense_date", "-created_at")
        .first()
    )

    oldest_expense = (
        Expense.objects.filter(user=user)
        .order_by("expense_date", "created_at")
        .first()
    )

    return {
        "highest_expense": {
            "title": highest_expense.title,
            "amount": highest_expense.amount,
            "category": highest_expense.category,
            "expense_date": highest_expense.expense_date,
        } if highest_expense else None,

        "lowest_expense": {
            "title": lowest_expense.title,
            "amount": lowest_expense.amount,
            "category": lowest_expense.category,
            "expense_date": lowest_expense.expense_date,
        } if lowest_expense else None,

        "latest_expense": {
            "title": latest_expense.title,
            "amount": latest_expense.amount,
            "category": latest_expense.category,
            "expense_date": latest_expense.expense_date,
        } if latest_expense else None,

        "oldest_expense": {
            "title": oldest_expense.title,
            "amount": oldest_expense.amount,
            "category": oldest_expense.category,
            "expense_date": oldest_expense.expense_date,
        } if oldest_expense else None,
    }


def get_recent_transactions(user):
    expenses = [
        {
            "type": "Expense",
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "date": expense.expense_date,
        }
        for expense in Expense.objects.filter(user=user)
    ]
    incomes = [
        {
            "type": "Income",
            "title": income.source,
            "amount": income.amount,
            "category": "Income",
            "date": income.income_date,
        }
        for income in Income.objects.filter(user=user)
    ]
    transactions = expenses + incomes
    transactions.sort(
        key=lambda x: x["date"],
        reverse=True
    )
    return transactions[:10]


def get_latest_notifications(user):

    notifications = Notification.objects.filter(
        user=user
    ).order_by("-created_at")[:5]

    return [
        {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]


def get_active_savings_goals(user):

    goals = SavingsGoal.objects.filter(
        user=user,
        status="In Progress"
    ).order_by("target_date")

    result = []
    for goal in goals:

        remaining = goal.target_amount - goal.saved_amount

        if goal.target_amount > 0:
            progress = round(
                (goal.saved_amount / goal.target_amount) * 100,
                2
            )
        else:
            progress = 0
        result.append({
            "goal_name": goal.goal_name,
            "target_amount": goal.target_amount,
            "saved_amount": goal.saved_amount,
            "remaining_amount": remaining,
            "progress_percentage": progress,
            "target_date": goal.target_date,
            "status": goal.status,
        })
    return result