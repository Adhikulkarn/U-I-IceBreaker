from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from challenges.models import Challenge
from challenges.serializers import ChallengeSerializer

from .models import Room
from .serializers import RoomSerializer
from .utils import build_room_state, broadcast_room_state

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
    room.round_started_at = timezone.now()
    room.save()

    channel_layer = get_channel_layer()

    round_payload = {
        "event": "ROUND_STARTED",
        "current_round": room.current_round,
        "game_state": room.game_state,
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": round_payload
        }
    )

    challenge_payload = {
        "event": "CHALLENGE_UPDATED",
        "challenge": ChallengeSerializer(challenge).data
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": challenge_payload
        }
    )

    broadcast_room_state(room)

    return Response(round_payload)


@api_view(['DELETE'])
def delete_room(request, room_code):

    try:
        room = Room.objects.get(code=room_code)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    channel_layer = get_channel_layer()

    payload = {
        "event": "ROOM_DELETED",
        "room_code": room.code
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": payload
        }
    )

    room.delete()

    return Response({"message": "Room deleted"})

@api_view(['GET'])
def get_room_state(request, room_code):

    try:
        room = Room.objects.get(code=room_code)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response(build_room_state(room))

@api_view(['GET'])
def get_rooms(request):

    rooms = Room.objects.filter(
        is_active=True
    ).order_by('-created_at')

    serializer = RoomSerializer(
        rooms,
        many=True
    )

    return Response(serializer.data)
