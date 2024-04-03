from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("tournois", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("tournois", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def tournoi_cree(self, event):
        # Appel de loadTournois() pour mettre à jour la liste des tournois
        logging.critical("Consumeressssssssssssssssssss")
        await self.send(text_data=json.dumps({
            "action": "reload_tournois"
        }))