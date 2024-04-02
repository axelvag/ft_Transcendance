from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def tournoi_cree(self, event):
        # Appel de loadTournois() pour mettre à jour la liste des tournois
        print("Message WebSocket 'tournoi_cree' reçu:", event)
        await self.send(text_data=json.dumps({
            "action": "reload_tournois"
        }))