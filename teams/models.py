from django.db import models
from rooms.models import Room
from players.models import Player


class Team(models.Model):
    name = models.CharField(max_length=100)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    players = models.ManyToManyField(Player, related_name='teams')
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name