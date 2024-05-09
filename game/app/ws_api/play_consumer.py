from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
import json
import requests
from game.models import Game
from engine.GameEngine import GameEngine

engines = {}

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
    await self.send_group({
      'type': 'log',
      'game': self.game.json()
    })

    # start the game if both players are connected
    await database_sync_to_async(self.game.refresh_from_db)()
    if self.game.status == 'RUNNING' and self.game_id not in engines:
      engine = GameEngine()
      engines[self.game_id] = engine
      engine.subscribe(self.on_engine_event)
      await sync_to_async(engine.emit)('init', {})
      await sync_to_async(engine.emit)('start', {})

  async def disconnect(self, close_code):
    await self.channel_layer.group_discard(self.group_name, self.channel_name)
    await database_sync_to_async(self.game.leave)(self.user_id)

    # notify
    await self.send_group({
      'type': 'log',
      'game': self.game.json()
    })

  async def receive(self, text_data):
    try:
      data = json.loads(text_data)
      action = data.get('action', None)
      recieved_data = data.get('data', None)

      if action == 'end':
        result = await database_sync_to_async(self.game.end)(recieved_data)
        if result:
          await self.send_group({
            'type': 'log',
            'game': self.game.json()
          })
    except json.JSONDecodeError:
      return

  async def send_group(self, data):
    await self.channel_layer.group_send(
      self.group_name,
      {
        'type': 'game.message',
        'message': data,
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

  def on_engine_event(self, data):
    # send the data to the players
    async_to_sync(self.send_group)(data)
    # check if the game is finished
    type = data.get('type', None)
    if type != 'update':
      return
    gameState = data.get('state', None)
    if gameState is None:
      return
    gameState_status = gameState.get('status', None)
    if (gameState_status == 'finished'):
      player_left_score = gameState.get('scoreLeft', 0)
      player_right_score = gameState.get('scoreRight', 0)
      if player_left_score > player_right_score:
        winner_id = self.game.player_left_id
      else:
        winner_id = self.game.player_right_id
      self.game.end({
        'winner_id': winner_id,
        'player_left_score': player_left_score,
        'player_right_score': player_right_score,
      })
      engines[self.game_id].reset()

