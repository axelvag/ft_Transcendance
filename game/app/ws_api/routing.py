from django.urls import path, re_path
from .search_opponent_consumer import SearchOpponentConsumer
from .play_consumer import PlayConsumer
from .user_status_consumer import UserStatusConsumer

websocket_urlpatterns = [
    path("search-opponent", SearchOpponentConsumer.as_asgi()),
    re_path(r"play/(?P<game_id>\w+)", PlayConsumer.as_asgi()),
    path("user-status", UserStatusConsumer.as_asgi()),
]
