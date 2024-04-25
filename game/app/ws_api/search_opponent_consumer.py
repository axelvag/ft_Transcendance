from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ValidationError
import json
import requests
from game.models import Game

class SearchOpponentConsumer(AsyncWebsocketConsumer):

  async def get_user_id(self):
    cookies = self.scope['headers']

    # Convert the headers to a dictionary
    cookies = dict(
      (key.decode('ascii'), value.decode('ascii')) for key, value in cookies if key.decode('ascii') == 'cookie'
    )

    # Find the sessionid cookie
    cookies_str = cookies.get('cookie', '')
    sessionid = None
    for cookie in cookies_str.split(';'):
      if 'sessionid' in cookie:
        sessionid = cookie.split('=')[1].strip()
        break

    if not sessionid:
      raise Exception('session ID not found')

    response = requests.get(f"https://authentification:8001/accounts/verif_sessionid/{sessionid}", verify=False)
    if response.status_code != 200:
      raise Exception('wrong session ID')
    
    user_id = response.json()['user_id']
    if not user_id:
      raise Exception('user not found')
    
    return str(user_id)
  
  async def connect(self):
    # Verify the session ID
    self.user_id = await self.get_user_id()
    if self.user_id is None:
      await self.close()
      return

    # Accept the connection
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