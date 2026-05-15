from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Room
from .serializers import RoomSerializer

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from challenges.models import Challenge

@api_view(['POST'])
def create_room(request):
    serializer = RoomSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def start_round(request):

    room_code = request.data.get('room_code')

    try:
        room = Room.objects.get(code=room_code)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    challenge = Challenge.objects.filter(
        room=room,
        is_active=True
    ).first()

    if not challenge:
        return Response(
            {"error": "No active challenge"}
        )

    room.current_round += 1
    room.game_state = "ROUND_ACTIVE"
    room.save()

    channel_layer = get_channel_layer()

    payload = {
        "event": "ROUND_STARTED",
        "round": room.current_round,
        "challenge": {
            "title": challenge.title,
            "description": challenge.description,
            "type": challenge.challenge_type,
            "duration": challenge.duration
        }
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": payload
        }
    )

    return Response(payload)