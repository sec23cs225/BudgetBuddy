from django.db import models
from django.contrib.auth.models import User


class Budget(models.Model):

    CATEGORY_CHOICES = [
        ("Food", "Food"),
        ("Travel", "Travel"),
        ("Shopping", "Shopping"),
        ("Bills", "Bills"),
        ("Entertainment", "Entertainment"),
        ("Healthcare", "Healthcare"),
        ("Education", "Education"),
        ("Others", "Others"),
    ]

    MONTH_CHOICES = [
        (1, "January"),
        (2, "February"),
        (3, "March"),
        (4, "April"),
        (5, "May"),
        (6, "June"),
        (7, "July"),
        (8, "August"),
        (9, "September"),
        (10, "October"),
        (11, "November"),
        (12, "December"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="budgets"
    )

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES
    )

    budget_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    month = models.IntegerField(
        choices=MONTH_CHOICES
    )

    year = models.IntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "category", "month", "year"],
                name="unique_budget_per_month"
            )
        ]

    def __str__(self):
        return f"{self.category} - ₹{self.budget_amount} ({self.month}/{self.year})"