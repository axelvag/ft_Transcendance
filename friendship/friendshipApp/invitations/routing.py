from django.urls import re_path
from friendshipApp import consumers

websocket_urlpatterns = [
    re_path(r"ws/invitations/(?P<user_id>\w+)/$", consumers.InvitationConsumer.as_asgi()),
]
