from django.urls import re_path
from .consumers import RoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_code>\w+)/$', RoomConsumer.as_asgi()),
]