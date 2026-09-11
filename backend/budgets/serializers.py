from datetime import datetime

from rest_framework import serializers
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
        ]

    def validate_budget_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Budget amount must be greater than zero."
            )

        return value

    def validate_year(self, value):

        current_year = datetime.now().year

        if value < current_year or value > current_year + 10:
            raise serializers.ValidationError(
                f"Year must be between {current_year} and {current_year + 10}."
            )

        return value