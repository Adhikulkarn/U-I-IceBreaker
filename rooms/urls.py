from django.urls import path
from .views import create_room, start_round, get_room_state
from .views import (
    create_room,
    start_round,
    get_room_state,
    get_rooms
)

urlpatterns = [
    path('', get_rooms),
    path('create/', create_room),
    path('start-round/', start_round),
    path('state/<str:room_code>/', get_room_state),
]