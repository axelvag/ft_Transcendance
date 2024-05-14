from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from apiTournament.models import Joueur
import requests
from asgiref.sync import sync_to_async

class MyConsumer(AsyncWebsocketConsumer):
    user_group_name = None  # Pour garder le nom du groupe de l'utilisateur

    async def connect(self):

        cookies = self.scope['headers']

        # Les en-têtes (et donc les cookies) sont encodés en bytes, donc vous devez les décoder
        cookies = dict(
            (key.decode('ascii'), value.decode('ascii')) for key, value in cookies if key.decode('ascii') == 'cookie'
        )

        # Les cookies sont maintenant une chaîne de caractères, vous devez donc trouver le cookie 'sessionid'
        cookies_str = cookies.get('cookie', '')
        sessionid = None
        for cookie in cookies_str.split(';'):
            if 'sessionid' in cookie:
                sessionid = cookie.split('=')[1].strip()
                break

        if sessionid:
            print(f"Session ID trouvé : {sessionid}")
            # Vous pouvez maintenant utiliser sessionid pour vos logiques de validation, etc.
        else:
            print("Session ID non trouvé")

        update_url = f"https://authentification:8001/accounts/verif_sessionid/{sessionid}"
        try:
            response = requests.get(update_url, verify=False)
        except requests.RequestException as e:
            print(f"Erreur de requête HTTP: {e}")
            return JsonResponse({'error': 'Erreur de communication avec le service externe'}, status=503)
        print(response)
        if response.status_code != 200:
            raise ValidationError('wrong session ID')

        await self.accept()

        # S'abonner à un groupe général pour tous les utilisateurs
        await self.channel_layer.group_add("tournois", self.channel_name)
        
        # L'ID de l'utilisateur et l'abonnement au groupe spécifique de l'utilisateur seront gérés via `receive`

    async def disconnect(self, close_code):
        logging.critical(f"WebSocket disconnected: {close_code}")
        # Se désabonner du groupe général
        await self.channel_layer.group_discard("tournois", self.channel_name)
        
        # Se désabonner du groupe spécifique de l'utilisateur si présent
        if self.user_group_name:
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
        
        # Se désabonner du groupe spécifique au tournoi si présent
        if hasattr(self, 'tournoi_group_name'):
            await self.channel_layer.group_discard(self.tournoi_group_name, self.channel_name)

    async def receive(self, text_data):
        logging.critical("Received data")
        text_data_json = json.loads(text_data)
        
        # Traitement pour associer un utilisateur à un groupe spécifique
        if 'user_id' in text_data_json:
            # self.user_id = text_data_json['user_id']
            user_id = text_data_json['user_id']
            self.user_group_name = f"user_{user_id}"
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            # Envoyer une confirmation ou un autre message au client si nécessaire
            
        # Traitement pour s'abonner à un groupe spécifique au tournoi
        if 'tournoi_id' in text_data_json:
            # self.tournoi_id = text_data_json['tournoi_id']
            tournoi_id = text_data_json['tournoi_id']
            self.tournoi_group_name = f"tournoi_{tournoi_id}"
            await self.channel_layer.group_add(self.tournoi_group_name, self.channel_name)
        
        # if 'user_id' in text_data_json and 'tournoi_id' in text_data_json:
        #     self.user_id = text_data_json['user_id']
        #     self.tournoi_id = text_data_json['tournoi_id']
            
        message = text_data_json.get('message')
        if message:
            # Traitement des messages. Cela pourrait être l'envoi d'un message au client, etc.
            await self.send(text_data=json.dumps({
                'message': message
            }))

    # Handlers pour les événements spécifiques
    async def tournoi_cree(self, event):
        logging.critical("Mise à jour de la liste des tournois")
        await self.send(text_data=json.dumps({
            "action": "reload_tournois"
        }))
        
    async def add_player(self, event):
        logging.critical("Ajout d'un joueur dans la liste")
        await self.send(text_data=json.dumps({
            "action": "add_Player"
        }))
        
    async def delete_tournament(self, event):
        await self.send(text_data=json.dumps({
            "action": "delete_tournament"
        }))
        
    # async def player_disconnected(self, event):
    #     await self.send(text_data=json.dumps({
    #         "action": "player_disconnected"
    #     }))
        
    async def display_player(self, event):
        await self.send(text_data=json.dumps({
            "action": "display_player"
        }))
        
    async def player_ready(self, event):
        await self.send(text_data=json.dumps({
            "action": "player_ready"
        }))
    
    async def winner(self, event):
        await self.send(text_data=json.dumps({
            "action": "winner"
        }))
        
    async def update_boutton(self, event):
        await self.send(text_data=json.dumps({
            "action": "update_boutton"
        }))
