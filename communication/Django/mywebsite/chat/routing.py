from django.urls import re_path 
from . import consumers


# la route de la web socket
websocket_urlpatterns = [
    re_path(r'ws/socket-server/', consumers.ChatConsumer.as_asgi())
]