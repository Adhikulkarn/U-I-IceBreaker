from django.urls import path
from .views import create_room

urlpatterns = [
    path('create/', create_room),
]