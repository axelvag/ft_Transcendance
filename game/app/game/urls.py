from django.contrib import admin
from django.urls import path
from .views import GameListView, GameItemView, GamePlayerHistoryView, UserGameStatusView

urlpatterns = [

  # Admin UI
  path('admin/', admin.site.urls),

  # Game Rest API
  path('games', GameListView.as_view(), name='game_list'),
  path('games/<str:game_id>', GameItemView.as_view(), name='game_item'),
  path('games/history/<str:player_id>', GamePlayerHistoryView.as_view(), name='game_player_history'),
  path('games/<str:user_id>/game-status', UserGameStatusView.as_view(), name='user_game_status'),

]
