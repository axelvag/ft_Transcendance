from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from .models import Game
import json


@method_decorator(csrf_exempt, name='dispatch')
class GameListView(View):
  
  def get(self, request):
    # List games
    games = Game.objects.all()
    games_data = [game.json() for game in games]
    return JsonResponse(games_data, safe=False, status=200)

  def post(self, request):
    # Create a new game
    try:
      data = json.loads(request.body)
      game = Game(player1_id=data.get('player1_id'), player2_id=data.get('player2_id'))
      game.save()
      return JsonResponse(game.json(), status=201)
    except json.JSONDecodeError:
      return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except ValidationError as e:
      errors = {field: message for field, message in e.message_dict.items()}
      return JsonResponse({'error': errors}, status=400)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class GameItemView(View):
  
  def get(self, request, game_id):
    # Get a specific game
    try:
      game = Game.objects.get(id=game_id)
      return JsonResponse(game.json())
    except Game.DoesNotExist:
      return JsonResponse({'error': 'Game does not exist'}, status=404)
    except Exception as e:
      return JsonResponse({'error': 'Invalid request'}, status=400)

  def put(self, request, game_id):
    # Update a game
    try:
      data = json.loads(request.body)
      game = Game.objects.get(id=game_id)

      # Data validation
      if data.get('player1_id') and data.get('player1_id') == game.player2_id:
        return JsonResponse({'error': 'player1_id and player2_id cannot be the same'}, status=400)
      if data.get('player2_id') and data.get('player2_id') == game.player1_id:
        return JsonResponse({'error': 'player1_id and player2_id cannot be the same'}, status=400)
      # todo check if player1_id  and player2_id exist

      game.player1_id = data.get('player1_id', game.player1_id)
      game.player2_id = data.get('player2_id', game.player2_id)
      game.save()
      return JsonResponse(game.json(), status=200)
    except json.JSONDecodeError:
      return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Game.DoesNotExist:
      return JsonResponse({'error': 'Game does not exist'}, status=404)
    except Exception as e:
      return JsonResponse({'error': 'Invalid request'}, status=400)

  def delete(self, request, game_id):
    # Delete a game
    try:
      game = Game.objects.get(id=game_id)
      game.delete()
      return JsonResponse({'message': 'Game deleted successfully'}, status=204)
    except Game.DoesNotExist:
      return JsonResponse({'error': 'Game does not exist'}, status=404)
    except Exception as e:
      return JsonResponse({'error': 'Invalid request'}, status=400)
