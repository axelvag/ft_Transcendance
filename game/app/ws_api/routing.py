from django.urls import re_path
from .search_opponent_consumer import SearchOpponentConsumer
from .play_consumer import PlayConsumer

websocket_urlpatterns = [
    re_path(r"search-opponent/(?P<user_id>\w+)", SearchOpponentConsumer.as_asgi()),
    re_path(r"play/(?P<game_id>\w+)/(?P<user_id>\w+)", PlayConsumer.as_asgi()),
]
