from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404

from .models import Income
from .serializers import IncomeSerializer

from notifications.utils import create_notification


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def income_list(request):

    if request.method == "GET":

        incomes = Income.objects.filter(
            user=request.user
        ).order_by("-income_date", "-created_at")

        serializer = IncomeSerializer(incomes, many=True)

        return Response(serializer.data)

    serializer = IncomeSerializer(data=request.data)

    if serializer.is_valid():

        income = serializer.save(user=request.user)

        create_notification(
            user=request.user,
            title="Income Added",
            message=f'Income "{income.title}" of ₹{income.amount} was added under "{income.source}".',
            notification_type="Income",
        )

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
def income_detail(request, pk):

    income = get_object_or_404(
        Income,
        pk=pk,
        user=request.user
    )

    if request.method == "GET":

        serializer = IncomeSerializer(income)

        return Response(serializer.data)

    if request.method == "PUT":

        serializer = IncomeSerializer(
            income,
            data=request.data
        )

        if serializer.is_valid():

            updated_income = serializer.save(user=request.user)

            create_notification(
                user=request.user,
                title="Income Updated",
                message=f'Income "{updated_income.title}" was updated.',
                notification_type="Income",
            )

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Store values before deleting
    income_title = income.title
    income_amount = income.amount
    income_source = income.source

    income.delete()

    create_notification(
        user=request.user,
        title="Income Deleted",
        message=f'Income "{income_title}" of ₹{income_amount} from "{income_source}" was deleted.',
        notification_type="Income",
    )

    return Response(
        status=status.HTTP_204_NO_CONTENT
    )