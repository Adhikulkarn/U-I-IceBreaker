from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Room
from .serializers import RoomSerializer

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from challenges.models import Challenge

from django.utils import timezone

from players.models import Player
from teams.models import Team

from players.serializers import PlayerSerializer
from teams.serializers import TeamSerializer

from challenges.serializers import ChallengeSerializer

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

    payload = {
        "event": "ROUND_STARTED",
        "round": room.current_round,
        "challenge": {
            "title": challenge.title,
            "description": challenge.description,
            "type": challenge.challenge_type,
            "duration": challenge.duration,
            "started_at": room.round_started_at.isoformat()
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

@api_view(['GET'])
def get_room_state(request, room_code):

    try:
        room = Room.objects.get(code=room_code)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    players = Player.objects.filter(room=room)

    teams = Team.objects.filter(room=room)

    active_challenge = Challenge.objects.filter(
        room=room,
        is_active=True
    ).first()

    leaderboard = Team.objects.filter(
        room=room
    ).order_by('-score')

    return Response({

        "room": {
            "id": room.id,
            "name": room.name,
            "code": room.code,
            "current_round": room.current_round,
            "game_state": room.game_state,
        },

        "players": PlayerSerializer(players, many=True).data,

        "teams": TeamSerializer(teams, many=True).data,

        "active_challenge":
            ChallengeSerializer(active_challenge).data
            if active_challenge else None,

        "leaderboard": [
            {
                "team_id": team.id,
                "team_name": team.name,
                "score": team.score,
            }
            for team in leaderboard
        ]
    })