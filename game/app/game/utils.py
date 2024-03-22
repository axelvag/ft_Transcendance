from .models import Game

def create_game(player1_id, player2_id):
  return Game.objects.create(
    player1_id=player1_id,
    player2_id=player2_id,
  )
