from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from rooms.models import Room
from .models import Player
from .serializers import PlayerSerializer


@api_view(['POST'])
def join_room(request):
    room_code = request.data.get('room_code')
    player_name = request.data.get('name')

    try:
        room = Room.objects.get(code=room_code, is_active=True)
    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    player = Player.objects.create(
        name=player_name,
        room=room
    )

    serializer = PlayerSerializer(player)

    return Response(serializer.data, status=status.HTTP_201_CREATED)