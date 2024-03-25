import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import ws_api.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')

application = ProtocolTypeRouter(
  {
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(URLRouter(ws_api.routing.websocket_urlpatterns)),
  }
)
