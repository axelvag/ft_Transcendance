# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# import logging

# class MyConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#         await self.channel_layer.group_add("tournois", self.channel_name)

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard("tournois", self.channel_name)

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         await self.send(text_data=json.dumps({
#             'message': message
#         }))

#     async def tournoi_cree(self, event):
#         # Appel de loadTournois() pour mettre à jour la liste des tournois
#         logging.critical("Consumeressssssssssssssssssss")
#         await self.send(text_data=json.dumps({
#             "action": "reload_tournois"
#         }))
        
#     async def add_Player(self, event):
#         # Appel de loadTournois() pour mettre à jour la liste des tournois
#         logging.critical("Consumeressssssssssssssssssss add player")
#         await self.send(text_data=json.dumps({
#             "action": "add_Player"
#         }))

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

class MyConsumer(AsyncWebsocketConsumer):
    user_group_name = None  # Pour garder le nom du groupe de l'utilisateur

    async def connect(self):
        await self.accept()

        # S'abonner à un groupe général pour tous les utilisateurs
        await self.channel_layer.group_add("tournois", self.channel_name)
        
        # L'ID de l'utilisateur et l'abonnement au groupe spécifique de l'utilisateur seront gérés via `receive`

    async def disconnect(self, close_code):
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
            user_id = text_data_json['user_id']
            self.user_group_name = f"user_{user_id}"
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            # Envoyer une confirmation ou un autre message au client si nécessaire
            
        # Traitement pour s'abonner à un groupe spécifique au tournoi
        if 'tournoi_id' in text_data_json:
            tournoi_id = text_data_json['tournoi_id']
            self.tournoi_group_name = f"tournoi_{tournoi_id}"
            await self.channel_layer.group_add(self.tournoi_group_name, self.channel_name)
            
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


