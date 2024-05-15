# user_status_consumer.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
import json
import requests
from game.models import Game
from engine.GameEngine import GameEngine

class UserStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Retrieve user_id from the session or other means
        self.user_id = await self.get_user_id()
        if self.user_id is None:
            await self.close()
            return

        # Add the user to their personal group
        self.group_name = f"user_{self.user_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Handle received messages if needed
        pass

    async def user_in_game(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'user_in_game',
            'message': message
        }))

    async def get_user_id(self):
        # Implement logic to retrieve user_id from headers or session
        cookies = self.scope['headers']

        # Convert the headers to a dictionary
        cookies = dict(
            (key.decode('ascii'), value.decode('ascii')) for key, value in cookies if key.decode('ascii') == 'cookie'
        )

        # Find the sessionid cookie
        cookies_str = cookies.get('cookie', '')
        sessionid = None
        for cookie in cookies_str.split(';'):
            if 'sessionid' in cookie:
                sessionid = cookie.split('=')[1].strip()
                break

        if not sessionid:
            raise Exception('session ID not found')

        response = requests.get(f"https://authentification:8001/accounts/verif_sessionid/{sessionid}", verify=False)
        if response.status_code != 200:
            raise Exception('wrong session ID')

        user_id = response.json()['user_id']
        if not user_id:
            raise Exception('user not found')

        return str(user_id)
