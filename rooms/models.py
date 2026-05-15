from django.db import models
import random
import string


def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Room(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=6, unique=True, default=generate_room_code)
    is_active = models.BooleanField(default=True)
    round_started_at = models.DateTimeField(null=True, blank=True)
    current_round = models.IntegerField(default=0)
    game_state = models.CharField(
        max_length=20,
        default='LOBBY'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"