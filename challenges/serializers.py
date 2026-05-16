from rest_framework import serializers
from .models import Challenge
from .models import Submission
from teams.serializers import TeamSerializer


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):

    team = TeamSerializer()

    class Meta:
        model = Submission
        fields = '__all__'