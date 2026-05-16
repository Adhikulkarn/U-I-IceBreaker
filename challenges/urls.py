from django.urls import path

from .views import (
    create_challenge,
    get_active_challenge,
    upload_submission
)

from .views import (
    create_challenge,
    get_active_challenge,
    upload_submission,
    get_submissions
)

urlpatterns = [
    path('create/', create_challenge),
    path('active/<str:room_code>/', get_active_challenge),
    path('submit/', upload_submission),

    path(
        'submissions/<int:challenge_id>/',
        get_submissions
    ),
]