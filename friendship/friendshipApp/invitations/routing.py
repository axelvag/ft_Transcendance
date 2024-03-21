# friendshipApp/invitations/routing.py
from django.urls import re_path
# from .consumers import InvitationConsumer
from friendshipApp import consumers

websocket_urlpatterns = [
    re_path(r'ws/invitations/$', consumers.InvitationConsumer.as_asgi()),
]
