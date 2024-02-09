# api/routing.py
from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    path("search-opponent", consumers.SearchOpponentConsumer.as_asgi()),
    # re_path(r"play/(?P<game_id>\w+)", consumers.PlayConsumer.as_asgi()),
    path("play", consumers.PlayConsumer.as_asgi()),
]