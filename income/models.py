from django.db import models
from django.contrib.auth.models import User


class Income(models.Model):

    SOURCE_CHOICES = [
        ("Salary", "Salary"),
        ("Freelancing", "Freelancing"),
        ("Business", "Business"),
        ("Investments", "Investments"),
        ("Bonus", "Bonus"),
        ("Rental", "Rental"),
        ("Others", "Others"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="incomes"
    )

    title = models.CharField(
        max_length=100
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    source = models.CharField(
        max_length=30,
        choices=SOURCE_CHOICES
    )

    income_date = models.DateField()

    notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.title} - ₹{self.amount}"