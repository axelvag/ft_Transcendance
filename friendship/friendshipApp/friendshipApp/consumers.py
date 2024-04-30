# friendshipApp/invitations/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from invitations.models import Notification, UserStatus
from channels.db import database_sync_to_async
from django.utils import timezone
import logging
import requests

class InvitationConsumer(AsyncWebsocketConsumer):
    async def connect(self):

        # Verif sessionId
        cookies = self.scope['headers']
        cookies = dict(
            (key.decode('ascii'), value.decode('ascii')) for key, value in cookies if key.decode('ascii') == 'cookie'
        )
        cookies_str = cookies.get('cookie', '')
        sessionid = None
        for cookie in cookies_str.split(';'):
            if 'sessionid' in cookie:
                sessionid = cookie.split('=')[1].strip()
                break

        if sessionid:
            print(f"Session ID trouvé : {sessionid}")
        else:
            print("Session ID non trouvé")

        update_url = f"https://authentification:8001/accounts/verif_sessionid/{sessionid}"
        response = requests.get(update_url, verify=False)
        # print(response)
        if response.status_code != 200:
            raise ValidationError('wrong session ID')

        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f"user{self.user_id}"

        # Rejoindre le groupe
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Marquer l'utilisateur comme en ligne
        await self.update_user_status(True)

        # Récupérer et envoyer les notifications non livrées de manière asynchrone
        notifications = await self.get_undelivered_notifications()
        # unread_invitations_count = await self.get_unread_invitations_count()
        for notification in notifications:
            await self.send(text_data=json.dumps({"message": notification.message}))
            # await self.mark_notification_as_delivered(notification)
            await self.mark_notification_as_delivered_by_id(notification.id)

    # return list, obliger pour pouvoir iterer sur un querySet
    @database_sync_to_async
    def get_undelivered_notifications(self):
        return list(Notification.objects.filter(user_id=self.user_id, delivered=False))

    @database_sync_to_async
    def mark_notification_as_delivered_by_id(self, notification_id):
        # Trouver la notification par son ID et la marquer comme livrée
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.delivered = True
            notification.save()
        except Notification.DoesNotExist:
            pass  # Gérer l'exception si nécessaire

    @database_sync_to_async
    def update_user_status(self, is_online):
        UserStatus.objects.update_or_create(
            user_id=self.user_id, 
            defaults={'is_online': is_online, 'last_seen': timezone.now()}
        )

    async def disconnect(self, close_code):
        # Marquer l'utilisateur comme hors ligne lors de la déconnexion
        await self.update_user_status(False)
        # Quitter le groupe
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'notification_received':
            notification_id = text_data_json['id']
            logging.critical("Helloooooooooo")
            await self.mark_notification_as_delivered_by_id(notification_id)
        # pass


    async def invitation_notification(self, event):
        # print(f"Sending invitation notification: {event}")
        logging.critical(event)
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "id": event["id"]
        }))

    # WS action
    async def accept_invitation(self, event):
        await self.send(text_data=json.dumps({
            "action": event["message"]
        }))

    async def reject_invitation(self, event):
        await self.send(text_data=json.dumps({
            "action": event["message"]
        }))

    async def cancel_invitation(self, event):
        await self.send(text_data=json.dumps({
            "action": event["message"]
        }))

    async def remove_friend(self, event):
        await self.send(text_data=json.dumps({
            "action": event["message"]
        }))