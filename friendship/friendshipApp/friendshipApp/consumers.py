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

        update_url = f"https://authentification:8001/accounts/verif_sessionid/{sessionid}/"
        try:
            response = requests.get(update_url, verify=False)
        except requests.RequestException as e:
            print(f"Erreur de requête HTTP: {e}")
            return JsonResponse({'error': 'Erreur de communication avec le service externe'}, status=503)

        if response.status_code != 200:
            raise ValidationError('wrong session ID')

        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f"user{self.user_id}"

        # join group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # sign user online
        await self.update_user_status(True)

        # get and send notification asynchrone
        notifications = await self.get_undelivered_notifications()
        for notification in notifications:
            await self.send(text_data=json.dumps({"message": notification.message}))
            await self.mark_notification_as_delivered_by_id(notification.id)

    # return list, required to iterate on querySet
    @database_sync_to_async
    def get_undelivered_notifications(self):
        return list(Notification.objects.filter(user_id=self.user_id, delivered=False))

    @database_sync_to_async
    def mark_notification_as_delivered_by_id(self, notification_id):
        # Find notif with this id 
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.delivered = True
            notification.save()
        except Notification.DoesNotExist:
            pass

    @database_sync_to_async
    def update_user_status(self, is_online):
        UserStatus.objects.update_or_create(
            user_id=self.user_id, 
            defaults={'is_online': is_online, 'last_seen': timezone.now()}
        )

    async def disconnect(self, close_code):
        # sign user offline
        await self.update_user_status(False)
        # leave group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'notification_received':
            notification_id = text_data_json['id']
            logging.critical("Helloooooooooo")
            await self.mark_notification_as_delivered_by_id(notification_id)


    async def invitation_notification(self, event):
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