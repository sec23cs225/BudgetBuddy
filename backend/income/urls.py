from django.urls import path
from .views import income_list, income_detail

urlpatterns = [
    path("", income_list),
    path("<int:pk>/", income_detail),
]