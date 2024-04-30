# """
# ASGI config for tournament project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
# """

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tournament.settings')

# application = get_asgi_application()

import os

# Définir la variable d'environnement DJANGO_SETTINGS_MODULE pour les paramètres Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tournament.settings')

import django

# Initialisez Django
django.setup()

from django.conf import settings
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import ws_api.routing

# Définit les routes Channels
application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(ws_api.routing.websocket_urlpatterns)
        ),
    }
)
