from django.urls import path
from . import views

from .views import (
    dashboard_summary,
    category_breakdown,
    monthly_expense_trend,
    income_vs_expense,
    budget_performance,

)
urlpatterns = [
    path(
        "dashboard/",
        dashboard_summary,
        name="dashboard-summary",
    ),
    path(
        "category-breakdown/",
        category_breakdown,
        name="category-breakdown",
    ),
    path(
        "monthly-trend/",
        monthly_expense_trend,
        name="monthly-expense-trend",
    ),
    path(
    "income-vs-expense/",
    income_vs_expense,
    name="income-vs-expense",
    ),
    path(
    "budget-performance/",
    budget_performance,
    name="budget-performance",
    ),
]