from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from django.db.models import Q
from .models import Game
import json
import requests

def verify_sessionid(request):
  session_id = request.COOKIES.get('sessionid', None)
  response = requests.get(f"https://authentification:8001/accounts/verif_sessionid/{session_id}", verify=False)
  return response.json()['user_id']

@method_decorator(csrf_exempt, name='dispatch')
class GameListView(View):
  
  def get(self, request):
    try:
      verify_sessionid(request)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=403)

    # List games
    games = Game.objects.all()
    games_data = [game.json() for game in games]
    return JsonResponse(games_data, safe=False, status=200)

  def post(self, request):
    try:
      verify_sessionid(request)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=403)

    # Create a new game
    try:
      data = json.loads(request.body)
      game = Game(player_left_id=data.get('player_left_id'), player_right_id=data.get('player_right_id'))
      game.save()
      return JsonResponse(game.json(), safe=False, status=201)
    except json.JSONDecodeError:
      return JsonResponse({'error': 'Invalid JSON'}, safe=False, status=400)
    except ValidationError as e:
      errors = {field: message for field, message in e.message_dict.items()}
      return JsonResponse({'error': errors}, safe=False, status=400)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class GameItemView(View):
  
  def get(self, request, game_id):
    try:
      verify_sessionid(request)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=403)

    # Get a specific game
    try:
      game = Game.objects.get(id=game_id)
      return JsonResponse(game.json())
    except Game.DoesNotExist:
      return JsonResponse({'error': 'Game does not exist'}, safe=False, status=404)
    except Exception as e:
      return JsonResponse({'error': 'Invalid request'}, safe=False, status=400)

  def put(self, request, game_id):
    try:
      verify_sessionid(request)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=403)

    # Update a game
    try:
      data = json.loads(request.body)
      game = Game.objects.get(id=game_id)

      # Data validation
      if data.get('player_left_id') and data.get('player_left_id') == game.player_right_id:
        return JsonResponse({'error': 'player_left_id and player_right_id cannot be the same'}, safe=False, status=400)
      if data.get('player_right_id') and data.get('player_right_id') == game.player_left_id:
        return JsonResponse({'error': 'player_left_id and player_right_id cannot be the same'}, safe=False, status=400)
      # todo check if player_left_id  and player_right_id exist

      game.player_left_id = data.get('player_left_id', game.player_left_id)
      game.player_right_id = data.get('player_right_id', game.player_right_id)
      game.save()
      return JsonResponse(game.json(), safe=False, status=200)
    except json.JSONDecodeError:
      return JsonResponse({'error': 'Invalid JSON'}, safe=False, status=400)
    except Game.DoesNotExist:
      return JsonResponse({'error': 'Game does not exist'}, safe=False, status=404)
    except Exception as e:
      return JsonResponse({'error': 'Invalid request'}, safe=False, status=400)

  def delete(self, request, game_id):
    try:
      verify_sessionid(request)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=403)

    # Delete a game
    try:
      game = Game.objects.get(id=game_id)
      game.delete()
      return JsonResponse({'message': 'Game deleted successfully'}, safe=False, status=204)
    except Game.DoesNotExist:
      return JsonResponse({'error': 'Game does not exist'}, safe=False, status=404)
    except Exception as e:
      return JsonResponse({'error': 'Invalid request'}, safe=False, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class GamePlayerHistoryView(View):
  
  def get(self, request):
    
    player_id = None
    try:
      player_id = verify_sessionid(request)
    except Exception as e:
      return JsonResponse({'error': str(e)}, safe=False, status=403)
    
    # Get game history for a player
    games = Game.objects.filter(
      Q(player_left_id=player_id) | Q(player_right_id=player_id),
      status='FINISHED'
    ).order_by('-ended_at')
  
    computed_games = []
    for game in games:
      game_data = game.json()
      if game.player_left_id == player_id:
        player_score = game_data['player_left_score']
        opponent_score = game_data['player_right_score']
        opponent_id = game_data['player_right_id']
      else:
        player_score = game_data['player_right_score']
        opponent_score = game_data['player_left_score']
        opponent_id = game_data['player_left_id']
      is_victory = game_data['winner_id'] == player_id
      won_by_forfeit = game_data['won_by_forfeit']
      player_forfeit = won_by_forfeit and not is_victory
      opponent_forfeit = won_by_forfeit and is_victory
      computed_games.append({
        'id': game_data.get('id', None),
        'opponent_id': opponent_id,
        'player_score': player_score,
        'player_forfeit': player_forfeit,
        'opponent_score': opponent_score,
        'opponent_forfeit': opponent_forfeit,
        'is_victory': is_victory,
        'ended_at': game_data.get('ended_at', None),
      })
    return JsonResponse(computed_games, safe=False, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class UserGameStatusView(View):
    def get(self, request, user_id):
        # Find any game where the user is currently playing
        current_game = Game.objects.filter(
            (Q(player_left_id=user_id) | Q(player_right_id=user_id)) & Q(status='RUNNING')
        ).first()

        if current_game:
            # User is currently in a game
            return JsonResponse({
                'in_game': True
            }, status=200)
        else:
            # User is not in any current game
            return JsonResponse({'in_game': False}, status=204)