from django.db import models
from rooms.models import Room


class Challenge(models.Model):

    CHALLENGE_TYPES = [
        ('PHOTO', 'Photo'),
        ('PITCH', 'Pitch'),
        ('PERFORMANCE', 'Performance'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    description = models.TextField()

    challenge_type = models.CharField(
        max_length=20,
        choices=CHALLENGE_TYPES
    )

    duration = models.IntegerField(default=120)

    is_active = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title