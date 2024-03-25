# friendshipApp/invitations/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from invitations.models import Notification
from channels.db import database_sync_to_async

class InvitationConsumer(AsyncWebsocketConsumer):
    # 1)
    # async def connect(self):
        
    #     print(self.scope['url_route']['kwargs'])
    #     # print(f"user_id: {self.user_id}")

    #     self.user_id = self.scope['url_route']['kwargs']['user_id']
    #     self.group_name = f"user{self.user_id}"

        
    #     # Rejoindre le groupe
    #     await self.channel_layer.group_add(
    #         self.group_name,
    #         self.channel_name
    #     )
        
    #     await self.accept()

    # 2)
    # async def connect(self):
    #     self.user_id = self.scope['url_route']['kwargs']['user_id']
    #     self.group_name = f"user{self.user_id}"

    #     # Rejoindre le groupe
    #     await self.channel_layer.group_add(self.group_name, self.channel_name)
    #     await self.accept()

    #     # Envoyer les notifications non livrées
    #     notifications = Notification.objects.filter(user_id=self.user_id, delivered=False)
    #     for notification in notifications:
    #         await self.send(text_data=json.dumps({"message": notification.message}))
    #         notification.delivered = True
    #         notification.save()

    #3)
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f"user{self.user_id}"

        # Rejoindre le groupe
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Récupérer et envoyer les notifications non livrées de manière asynchrone
        notifications = await self.get_undelivered_notifications()
        for notification in notifications:
            await self.send(text_data=json.dumps({"message": notification.message}))
            await self.mark_notification_as_delivered(notification)

    @database_sync_to_async
    def get_undelivered_notifications(self):
        return list(Notification.objects.filter(user_id=self.user_id, delivered=False))
        
    @database_sync_to_async
    def mark_notification_as_delivered(self, notification):
        notification.delivered = True
        notification.save()

    async def disconnect(self, close_code):
        pass

    # async def receive(self, text_data=None, bytes_data=None):
    #     text_data_json = json.loads(text_data)
    #     message = text_data_json["message"]

    #     self.send(text_data=json.dumps({"message": message}))

    async def receive(self, text_data=None, bytes_data=None):
        await self.send(text_data=json.dumps({"message": "Test response from server"}))


    async def invitation_notification(self, event):
        print(f"Sending invitation notification: {event}")
        await self.send(text_data=json.dumps({
            "message": event["message"]
        }))

