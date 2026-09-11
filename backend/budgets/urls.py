from django.urls import path
from .views import budget_list, budget_detail

urlpatterns = [
    path("", budget_list),
    path("<int:pk>/", budget_detail),
]