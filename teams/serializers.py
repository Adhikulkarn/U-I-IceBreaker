from rest_framework import serializers

from .models import Team
from players.serializers import PlayerSerializer


class TeamSerializer(serializers.ModelSerializer):

    players = PlayerSerializer(many=True)

    class Meta:
        model = Team
        fields = '__all__'