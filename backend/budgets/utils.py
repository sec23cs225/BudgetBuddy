from decimal import Decimal
from django.db import models
from expenses.models import Expense
from notifications.utils import create_notification


def check_budget_alert(budget):

    print("===== Budget Alert Function Called =====")

    try:
        total_spent = (
            Expense.objects.filter(
                user=budget.user,
                category=budget.category,
                expense_date__month=budget.month,
                expense_date__year=budget.year,
            )
            .aggregate(total=models.Sum("amount"))
            .get("total")
        )

        print("Total Spent:", total_spent)

        if total_spent is None:
            total_spent = Decimal("0.00")

        utilization = (total_spent / budget.budget_amount) * 100

        print("Budget Amount:", budget.budget_amount)
        print("Utilization:", utilization)

        if utilization >= 100:
            print("Exceeded")
            create_notification(
                user=budget.user,
                title="Budget Exceeded",
                message=f'You have exceeded your "{budget.category}" budget.',
                notification_type="Budget Alert",
            )

        elif utilization >= 80:
            print("Warning")
            create_notification(
                user=budget.user,
                title="Budget Warning",
                message=f'You have used 80% of your "{budget.category}" budget.',
                notification_type="Budget Alert",
            )

    except Exception as e:
        print("ERROR:", e)