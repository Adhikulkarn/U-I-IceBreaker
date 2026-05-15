import random

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from rooms.models import Room
from players.models import Player
from .models import Team
from .serializers import TeamSerializer


TEAM_NAMES = [
    "The Chaos Crew",
    "Drama Queens",
    "The Vibe Tribe",
    "Snack Attack",
    "Too Cool To Lose",
    "The Misfits",
    "Full Volume",
    "The Wildcards",
    "Laughing Legends",
    "Team No Sleep",
    "The Energy Pack",
    "Oops We Did It",
    "The Hustlers",
    "Confused But Confident",
    "The Mood Swingers",
    "Mission Possible",
    "The Banana Squad",
    "The Fun Bunch",
    "Zero Chill",
    "The Last Benchers"
]


@api_view(['POST'])
def generate_teams(request):
    room_code = request.data.get('room_code')
    team_size = int(request.data.get('team_size', 4))

    try:
        room = Room.objects.get(code=room_code)
    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    Team.objects.filter(room=room).delete()

    players = list(Player.objects.filter(room=room))
    random.shuffle(players)

    teams = []

    for i in range(0, len(players), team_size):
        chunk = players[i:i + team_size]

        team = Team.objects.create(
            room=room,
            name=random.choice(TEAM_NAMES)
        )

        team.players.set(chunk)

        teams.append(team)

    serializer = TeamSerializer(teams, many=True)

    return Response(serializer.data, status=status.HTTP_201_CREATED)