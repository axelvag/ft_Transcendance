from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError
import json
from game.models import Game

class SearchOpponentConsumer(AsyncWebsocketConsumer):
  
  async def connect(self):
    self.user_id = self.scope['url_route']['kwargs']['user_id']
    
    if not self.user_id:
      await self.close()
      return

    # todo: check if user is authenticated
    await self.accept()
    self.opponent_found = False
    await self.channel_layer.group_add("searching_players", self.channel_name)
    await self.search_opponent()

  async def disconnect(self, close_code):
    if self.opponent_found:
      return

    await self.channel_layer.group_discard("searching_players", self.channel_name)

  async def search_opponent(self):
    if self.opponent_found:
      return

    # Broadcast a message to the group asking if anyone is available
    await self.channel_layer.group_send(
      "searching_players",
      {
        'type': 'matchmaking',
        'channel_name': self.channel_name,
        'user_id': self.user_id
      }
    )

  async def matchmaking(self, event):
    if self.opponent_found or event['user_id'] == self.user_id:
      return
    
    self.opponent_found = True
    
    # Remove both players from the 'searching' group
    await self.channel_layer.group_discard("searching_players", self.channel_name)
    await self.channel_layer.group_discard("searching_players", event['channel_name'])

    # create a new game
    player_left_id = self.user_id
    player_right_id = event['user_id']

    game_id = await database_sync_to_async(self.create_game)(player_left_id, player_right_id)
    if game_id is None:
      await self.channel_layer.send(event['channel_name'], {
        'type': 'opponent.error',
        'message': 'An error occurred while creating the game'
      })
      await self.send(text_data=json.dumps({
        'type': 'error',
        'message': 'An error occurred while creating the game'
      }))
    else:
      # Notify players
      await self.channel_layer.send(event['channel_name'], {
        'type': 'opponent.success',
        'game_id': game_id,
        'player_left_id': player_left_id,
        'player_right_id': player_right_id,
      })
      await self.send(text_data=json.dumps({
        'game_id': game_id,
        'player_left_id': player_left_id,
        'player_right_id': player_right_id,
      }))

  async def opponent_success(self, event):
    await self.send(text_data=json.dumps({
      'game_id': event.get('game_id'),
      'player_left_id': event.get('player_left_id'),
      'player_right_id': event.get('player_right_id'),
    }))

  async def opponent_error(self, event):
    await self.send(text_data=json.dumps({
      'type': 'error',
      'message': event.get('message')
    }))

  def create_game(self, player_left_id, player_right_id):
    try:
      game = Game(player_left_id=player_left_id, player_right_id=player_right_id)
      game.save()
      return game.id
    except ValidationError as e:
      return None
    except Exception as e:
      return None
