from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from rooms.models import Room
from teams.models import Team
from .models import Player
from .serializers import PlayerSerializer
from teams.serializers import TeamSerializer

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rooms.utils import build_room_state, broadcast_room_state

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

    channel_layer = get_channel_layer()

    payload = {
        "event": "PLAYER_JOINED",
        "player": {
            "id": player.id,
            "name": player.name,
        }
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": payload
        }
    )

    broadcast_room_state(room)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def leave_room(request):
    player_id = request.data.get('player_id')

    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response(
            {"error": "Player not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    room = player.room
    deleted_player_id = player.id

    player.delete()

    channel_layer = get_channel_layer()

    payload = {
        "event": "PLAYER_LEFT",
        "player_id": deleted_player_id
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": payload
        }
    )

    broadcast_room_state(room)

    return Response({"message": "Player left room"})


@api_view(['GET'])
def get_player_state(request, player_id):
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response(
            {"error": "Player not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    room = player.room

    team = Team.objects.filter(
        players=player
    ).first()

    room_state = build_room_state(room)

    return Response({
        "player": PlayerSerializer(player).data,
        "team": TeamSerializer(team).data if team else None,
        **room_state
    })
