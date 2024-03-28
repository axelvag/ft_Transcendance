from .models import Game

def create_game(player_left_id, player_right_id):
  return Game.objects.create(
    player_left_id=player_left_id,
    player_right_id=player_right_id,
  )
