import json
from channels.generic.websocket import AsyncWebsocketConsumer

searching_players = set()

class SearchOpponentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # todo: check if user is authenticated
        await self.accept()
        await self.search()

    async def disconnect(self, close_code):
        searching_players.discard(self.channel_name)

    async def search(self):
        global searching_players

        if not searching_players:
            searching_players.add(self.channel_name)
        else:
            opponent_channel_name = searching_players.pop()
            # todo: create a game and save it to the database

            # Notify the opponent
            await self.channel_layer.send(opponent_channel_name, {
                'type': 'opponent.found',
                'game_id': "123"
            })
            # Notify self
            await self.channel_layer.send(self.channel_name, {
                'type': 'opponent.found',
                'game_id': "123"
            })

    async def opponent_found(self, event):
        await self.send(text_data=json.dumps({
            'game_id': event.get('game_id')
        }))
