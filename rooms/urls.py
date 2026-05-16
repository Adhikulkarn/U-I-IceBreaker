from django.urls import path
from .views import create_room, start_round, get_room_state

urlpatterns = [
    path('create/', create_room),
    path('start-round/', start_round),
    path('state/<str:room_code>/', get_room_state),
]