import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .engine import GameEngine

searching_players = set()

class SearchOpponentConsumer(WebsocketConsumer):
  def connect(self):
    # todo: check if user is authenticated
    self.accept()
    self.search()

  def disconnect(self, close_code):
    searching_players.discard(self.channel_name)

  def search(self):
    if not searching_players:
      searching_players.add(self.channel_name)
    else:
      opponent_channel_name = searching_players.pop()
      # todo: create a game and save it to the database

      # Notify the opponent
      async_to_sync(self.channel_layer.send)(opponent_channel_name, {
        'type': 'opponent.found',
        'game_id': "123"
      })
      # Notify self
      async_to_sync(self.channel_layer.send)(self.channel_name, {
        'type': 'opponent.found',
        'game_id': "123"
      })

  def opponent_found(self, event):
    self.send(text_data=json.dumps({
      'game_id': event.get('game_id')
    }))

games = {}
class PlayConsumer(WebsocketConsumer):

  def connect(self):
    # self.game_id = self.scope['url_route']['kwargs']['game_id']
    self.game_id = self.scope['query_string'].decode().split('=')[1]

    # todo: replace by game instance
    if self.game_id not in games:
      engine = GameEngine.GameEngine()
      engine.subscribe(self.send_group_fn(self.game_id))
      games[self.game_id] = {
        'players': [],
        'engine': engine
      }
    games[self.game_id]['players'].append(self.channel_name)
    async_to_sync(self.channel_layer.group_add)(
      self.game_id,
      self.channel_name
    )
    self.accept()
    if len(games[self.game_id]['players']) == 2:
      engine = games[self.game_id]['engine']
      engine.emit('init')
      engine.emit('start')

  def disconnect(self, close_code):
    async_to_sync(self.channel_layer.group_discard)(
      self.game_id,
      self.channel_name
    )

  def receive(self, text_data):
    pass

  def send_group_fn(self, game_id):
    def send_group(event):
      async_to_sync(self.channel_layer.group_send)(game_id, {
        'type': 'notify',
        'event': event.get('event'),
        'state': event.get('state')
      })
    return send_group

  def notify(self, event):
    self.send(text_data=json.dumps({
      'event': event.get('event'),
      'state': event.get('state')
    }))
  
  