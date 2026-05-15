from django.urls import path
from .views import create_challenge, get_active_challenge

urlpatterns = [
    path('create/', create_challenge),
    path('active/<str:room_code>/', get_active_challenge),
]