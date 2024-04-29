from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
import requests
from game.models import Game

# @method_decorator(csrf_exempt, name='dispatch')
class PlayConsumer(AsyncWebsocketConsumer):
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

    # check if game exists and is waiting for players
    self.game_id = self.scope['url_route']['kwargs']['game_id']
    self.game = await database_sync_to_async(self.get_game)(self.game_id)
    if self.game is None or self.game.status != 'WAITING':
      await self.close()
      return
    
    # join the game
    has_joined = await database_sync_to_async(self.game.join)(self.user_id)
    if not has_joined:
      await self.close()
      return
    
    # accept the connection
    await self.accept()
    
    # add the user to the game group
    self.group_name = f"game_{self.game_id}"
    await self.channel_layer.group_add(self.group_name, self.channel_name)

    # notify
    await self.send_group({'game': self.game.json()})

  async def disconnect(self, close_code):
    await self.channel_layer.group_discard(self.group_name, self.channel_name)
    await database_sync_to_async(self.game.leave)(self.user_id)

    # notify
    await self.send_group({'game': self.game.json()})

  async def receive(self, text_data):
    try:
      data = json.loads(text_data)
      action = data.get('action', None)
      recieved_data = data.get('data', None)

      if action == 'end':
        result = await database_sync_to_async(self.game.end)(recieved_data)
        if result:
          await self.send_group({'game': self.game.json()})
    except json.JSONDecodeError:
      # Handle the exception if the text data is not valid JSON
      print("Error decoding JSON", text_data.strip())
      return

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
    await self.send(text_data=json.dumps(message))

  def get_game(self, game_id):
    try:
      return Game.objects.get(id=game_id)
    except Game.DoesNotExist:
      return None
    except Exception as e:
      return None