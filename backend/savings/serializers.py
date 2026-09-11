from rest_framework import serializers
from .models import SavingsGoal


class SavingsGoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = SavingsGoal
        fields = "__all__"
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):

        if validated_data["saved_amount"] >= validated_data["target_amount"]:
            validated_data["status"] = "Completed"
        else:
            validated_data["status"] = "In Progress"

        return super().create(validated_data)

    def update(self, instance, validated_data):

        if validated_data["saved_amount"] >= validated_data["target_amount"]:
            validated_data["status"] = "Completed"
        else:
            validated_data["status"] = "In Progress"

        return super().update(instance, validated_data)

    def validate_target_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Target amount must be greater than zero."
            )

        return value

    def validate_saved_amount(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Saved amount cannot be negative."
            )

        return value

    def validate(self, data):

        if data["saved_amount"] > data["target_amount"]:
            raise serializers.ValidationError(
                "Saved amount cannot exceed target amount."
            )

        return data


class SavingsProgressSerializer(serializers.ModelSerializer):

    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    goal_status = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            "id",
            "goal_name",
            "target_amount",
            "saved_amount",
            "remaining_amount",
            "progress_percentage",
            "goal_status",
            "target_date",
        ]

    def get_remaining_amount(self, obj):
        return obj.target_amount - obj.saved_amount

    def get_progress_percentage(self, obj):
        if obj.target_amount == 0:
            return 0

        return round((obj.saved_amount / obj.target_amount) * 100, 2)

    def get_goal_status(self, obj):
        return obj.status