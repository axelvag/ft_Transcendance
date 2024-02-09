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

games = {}
class PlayConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_id = self.scope['query_string'].decode().split('=')[1]

        # todo: replace by game instance
        if self.game_id not in games:
            games[self.game_id] = []
        games[self.game_id].append(self.channel_name)

        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()

        await self.channel_layer.group_send(
            self.game_id,
            {
                'type': 'notify',
                'msg': 'hello world',
                'game_id': self.game_id
            }
        )

        # if len(games[self.game_id]) == 2:
        #     self._game = GameEngine({ 'notify': self.notify })

    async def disconnect(self, close_code):
        # games[self.game_id].remove(self.channel_name)
        self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def notify(self, event):
        await self.send(text_data=json.dumps({
            'msg': event.get('msg'),
            'game_id': event.get('game_id')
        }))
    
    