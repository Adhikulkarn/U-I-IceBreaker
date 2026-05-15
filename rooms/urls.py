from django.urls import path
from .views import create_room, start_round

urlpatterns = [
    path('create/', create_room),
    path('start-round/', start_round),
]