# api/routing.py
from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    path("search-opponent", consumers.SearchOpponentConsumer.as_asgi()),
]