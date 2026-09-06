from django.urls import path
from .views import savings_list, savings_detail

urlpatterns = [
    path("", savings_list),
    path("<int:pk>/", savings_detail),
]