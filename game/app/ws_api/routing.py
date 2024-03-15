from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"search-opponent/(?P<user_id>\w+)", consumers.SearchOpponentConsumer.as_asgi()),
    # re_path(r"play/(?P<game_id>\w+)/(?P<user_id>\w+)", consumers.PlayConsumer.as_asgi()),
]
