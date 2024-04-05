from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from apiTournament.models import Joueur

from asgiref.sync import sync_to_async

# Déplacez cette définition en dehors de la classe MyConsumer
@sync_to_async
def remove_player(user_id, tournoi_id):
    joueur = Joueur.objects.filter(user_id=user_id, tournament__id=tournoi_id).first()
    if joueur:
        joueur.tournament = None
        joueur.save()

class MyConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_id = None
        self.tournoi_id = None
    user_group_name = None  # Pour garder le nom du groupe de l'utilisateur

    async def connect(self):
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
        logging.critical("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
        if hasattr(self, 'tournoi_group_name') and hasattr(self, 'user_group_name'):
            await remove_player(self.user_id, self.tournoi_id)
            await self.channel_layer.group_send(
                self.tournoi_group_name,
                {
                    'type': 'display_player',
                    'message': 'Player has disconnected'
                }
            )
            logging.critical("supppppppppppppppppppppppppppppppppppppppppppppppppppp")

    async def receive(self, text_data):
        logging.critical("Received data")
        text_data_json = json.loads(text_data)
        
        # Traitement pour associer un utilisateur à un groupe spécifique
        if 'user_id' in text_data_json:
            self.user_id = text_data_json['user_id']
            user_id = text_data_json['user_id']
            self.user_group_name = f"user_{user_id}"
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            # Envoyer une confirmation ou un autre message au client si nécessaire
            
        # Traitement pour s'abonner à un groupe spécifique au tournoi
        if 'tournoi_id' in text_data_json:
            self.tournoi_id = text_data_json['tournoi_id']
            tournoi_id = text_data_json['tournoi_id']
            self.tournoi_group_name = f"tournoi_{tournoi_id}"
            await self.channel_layer.group_add(self.tournoi_group_name, self.channel_name)
        
        if 'user_id' in text_data_json and 'tournoi_id' in text_data_json:
            self.user_id = text_data_json['user_id']
            self.tournoi_id = text_data_json['tournoi_id']
            
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
        
    async def player_disconnected(self, event):
        await self.send(text_data=json.dumps({
            "action": "player_disconnected"
        }))
        
    async def display_player(self, event):
        await self.send(text_data=json.dumps({
            "action": "display_player"
        }))


