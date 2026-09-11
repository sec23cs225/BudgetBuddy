from django.contrib import admin
from django.urls import include, path

from reports.views import export_expense_report


urlpatterns = [
    path(
        "reports/export/",
        export_expense_report,
        name="export_expense_report",
    ),

    path(
        "",
        include("accounts.urls"),
    ),

    path(
        "expenses/",
        include("expenses.urls"),
    ),

    path(
        "income/",
        include("income.urls"),
    ),

    path(
        "budgets/",
        include("budgets.urls"),
    ),

    path(
        "savings/",
        include("savings.urls"),
    ),

    path(
        "notifications/",
        include("notifications.urls"),
    ),

    path(
        "analytics/",
        include("analytics.urls"),
    ),

    path(
        "reports/",
        include("reports.urls"),
    ),

    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "email/",
        include("notifications.email_urls"),
    ),
]