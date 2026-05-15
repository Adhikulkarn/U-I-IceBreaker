from django.urls import path
from .views import generate_teams

urlpatterns = [
    path('generate/', generate_teams),
]