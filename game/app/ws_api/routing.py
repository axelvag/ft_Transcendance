from django.urls import path, re_path
from .search_opponent_consumer import SearchOpponentConsumer
from .play_consumer import PlayConsumer

websocket_urlpatterns = [
    path(r"search-opponent", SearchOpponentConsumer.as_asgi()),
    re_path(r"play/(?P<game_id>\w+)", PlayConsumer.as_asgi()),
]
