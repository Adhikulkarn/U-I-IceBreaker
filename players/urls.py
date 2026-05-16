from django.urls import path
from .views import join_room, leave_room, get_player_state

urlpatterns = [
    path('join/', join_room),
    path('leave/', leave_room),
    path('state/<int:player_id>/', get_player_state),
]
