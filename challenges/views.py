import cloudinary.uploader

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from rooms.models import Room
from teams.models import Team

from .models import Challenge, Submission
from .serializers import ChallengeSerializer


@api_view(['POST'])
def create_challenge(request):

    room_code = request.data.get('room_code')

    try:
        room = Room.objects.get(code=room_code)

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    Challenge.objects.filter(
        room=room,
        is_active=True
    ).update(is_active=False)

    challenge = Challenge.objects.create(
        room=room,
        title=request.data.get('title'),
        description=request.data.get('description'),
        challenge_type=request.data.get('challenge_type'),
        duration=request.data.get('duration', 120),
        is_active=True
    )

    serializer = ChallengeSerializer(challenge)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_active_challenge(request, room_code):

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
            {"error": "No active challenge"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ChallengeSerializer(challenge)

    return Response(serializer.data)

@api_view(['POST'])
def upload_submission(request):

    challenge_id = request.data.get('challenge_id')
    team_id = request.data.get('team_id')

    image = request.FILES.get('image')

    try:
        challenge = Challenge.objects.get(id=challenge_id)
        team = Team.objects.get(id=team_id)

    except:
        return Response(
            {"error": "Invalid challenge or team"},
            status=status.HTTP_400_BAD_REQUEST
        )

    upload_result = cloudinary.uploader.upload(image)

    submission = Submission.objects.create(
        challenge=challenge,
        team=team,
        image_url=upload_result['secure_url']
    )

    return Response({
        "message": "Submission uploaded",
        "image_url": submission.image_url
    })