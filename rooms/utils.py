from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from players.models import Player
from teams.models import Team
from challenges.models import Challenge

from .serializers import RoomSerializer
from players.serializers import PlayerSerializer
from teams.serializers import TeamSerializer
from challenges.serializers import ChallengeSerializer


def build_room_state(room):
    players = Player.objects.filter(room=room)
    teams = Team.objects.filter(room=room)
    active_challenge = Challenge.objects.filter(
        room=room,
        is_active=True
    ).first()
    leaderboard = Team.objects.filter(
        room=room
    ).order_by('-score')

    room_data = RoomSerializer(room).data

    return {
        "room": room_data,
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
        ],
        "game_state": room_data.get("game_state"),
        "current_round": room_data.get("current_round"),
    }


def broadcast_room_state(room):
    channel_layer = get_channel_layer()
    payload = {
        "event": "ROOM_STATE_UPDATED",
        "state": build_room_state(room)
    }

    async_to_sync(channel_layer.group_send)(
        f"room_{room.code}",
        {
            "type": "game_update",
            "message": payload
        }
    )
