from .views import health_check
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/rooms/', include('rooms.urls')),
    path('api/players/', include('players.urls')),
    path('api/teams/', include('teams.urls')),
    path('api/challenges/', include('challenges.urls')),
]
