from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
import json
from game.models import Game

class PlayConsumer(AsyncWebsocketConsumer):
  async def connect(self):
    self.game_id = self.scope['url_route']['kwargs']['game_id']
    print('game_id', self.game_id)
    self.user_id = self.scope['url_route']['kwargs']['user_id']
    print('user_id', self.user_id)

    # check if game exists and is waiting for players
    self.game = await database_sync_to_async(self.get_game)(self.game_id)
    if self.game is None or self.game.status != 'WAITING':
      await self.close()
      return
    print('game', self.game.json())
    
    # check if user is part of the game
    if (self.user_id != self.game.player_left_id and self.user_id != self.game.player_right_id):
      await self.close()
      return
    print('is part of the game')
    
    # accept the connection
    await self.accept()
    
    # add the user to the game group
    self.group_name = f"game_{self.game_id}"
    await self.channel_layer.group_add(self.group_name, self.channel_name)
    await self.send_group(f'Player {self.user_id} has joined the game')

  async def send_group(self, data):
    await self.channel_layer.group_send(
      self.group_name,
      {
        'type': 'game.message',
        'message': data
      }
    )

  async def game_message(self, event):
    message = event['message']
    await self.send(text_data=json.dumps({
      'message': message
    }))

    # join the game
    # self.game.join(self.user_id)

    # # start the game if both players are connected
    # if self.game.status == 'READY':
    #   self.game.start(self.send_group_fn(self.group_name))
    #   await self.channel_layer.group_send(
    #     self.group_name,
    #     {
    #       'type': 'game.start',
    #     }
    #   )

  async def disconnect(self):
    await self.channel_layer.group_discard(self.group_name, self.channel_name)
    # await self.game.leave(self.user_id)
    # if self.game.status == 'ABORTED':
    #   await self.channel_layer.group_send(
    #     self.group_name,
    #     {
    #       'type': 'game.aborted',
    #     }
    #   )

  async def receive(self, text_data):
    pass

  def send_group_fn(self, group_name):
    def send_group(event):
      async_to_sync(self.channel_layer.group_send)(group_name, {
        'type': 'notify',
        'event': event.get('event'),
        'state': event.get('state')
      })
    return send_group

#   def send_group_fn(self, game_id):
#     def send_group(event):
#       async_to_sync(self.channel_layer.group_send)(game_id, {
#         'type': 'notify',
#         'event': event.get('event'),
#         'state': event.get('state')
#       })
#     return send_group

#   async def receive(self, text_data):
#     data_json = json.loads(text_data)
#     message = data_json['message']
#     await self.channel_layer.group_send(
#       self.game.group_name,
#       {
#         'type': 'game.message',
#         'message': message
#       }
#     )

#   async def game_message(self, event):
#     message = event['message']
#     await self.send(text_data=json.dumps({
#       'message': message
#     }))

#   async def disconnect(self, close_code):
#     await self.channel_layer.group_discard(self.game.group_name, self.channel_name)

  def get_game(self, game_id):
    try:
      return Game.objects.get(id=game_id)
    except Game.DoesNotExist:
      return None
    except Exception as e:
      return None

# # games = {}
# # class PlayConsumer(WebsocketConsumer):

# #   def connect(self):
# #     # self.game_id = self.scope['url_route']['kwargs']['game_id']
# #     self.game_id = self.scope['query_string'].decode().split('=')[1]

# #     # todo: replace by game instance
# #     if self.game_id not in games:
# #       engine = GameEngine()
# #       engine.subscribe(self.send_group_fn(self.game_id))
# #       games[self.game_id] = {
# #         'players': [],
# #         'engine': engine
# #       }
# #     games[self.game_id]['players'].append(self.channel_name)
# #     async_to_sync(self.channel_layer.group_add)(
# #       self.game_id,
# #       self.channel_name
# #     )
# #     self.accept()
# #     if len(games[self.game_id]['players']) == 2:
# #       engine = games[self.game_id]['engine']
# #       engine.emit('init')
# #       engine.emit('start')

# #   def disconnect(self, close_code):
# #     async_to_sync(self.channel_layer.group_discard)(
# #       self.game_id,
# #       self.channel_name
# #     )

# #   def receive(self, text_data):
# #     pass

# #   def send_group_fn(self, game_id):
# #     def send_group(event):
# #       async_to_sync(self.channel_layer.group_send)(game_id, {
# #         'type': 'notify',
# #         'event': event.get('event'),
# #         'state': event.get('state')
# #       })
# #     return send_group

# #   def notify(self, event):
# #     self.send(text_data=json.dumps({
# #       'event': event.get('event'),
# #       'state': event.get('state')
# #     }))
  
  