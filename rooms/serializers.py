from rest_framework import serializers

from .models import Room


class RoomSerializer(serializers.ModelSerializer):

    player_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'

    def get_player_count(self, obj):
        return obj.players.count()