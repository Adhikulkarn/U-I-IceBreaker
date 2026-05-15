from django.urls import path
from .views import join_room

urlpatterns = [
    path('join/', join_room),
]