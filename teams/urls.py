from django.urls import path
from .views import generate_teams, update_team_score

urlpatterns = [
    path('generate/', generate_teams),
    path('score/', update_team_score),
]