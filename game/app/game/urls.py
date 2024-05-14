from django.contrib import admin
from django.urls import path
from .views import GameListView, GameItemView, GamePlayerHistoryView, GamePlayerStatisticsView

urlpatterns = [

  # Admin UI
  path('admin/', admin.site.urls),

  # Game Rest API
  path('games', GameListView.as_view(), name='game_list'),
  path('games/<str:game_id>', GameItemView.as_view(), name='game_item'),
  path('game-history', GamePlayerHistoryView.as_view(), name='game_player_history'),
  path('game-statistics', GamePlayerStatisticsView.as_view(), name='game_player_statistics'),

]
