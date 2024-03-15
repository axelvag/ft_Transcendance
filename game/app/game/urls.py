from django.contrib import admin
from django.urls import path
from .views import GameListView, GameItemView

urlpatterns = [

  # Admin UI
  path('admin/', admin.site.urls),

  # Game Rest API
  path('games', GameListView.as_view(), name='game_list'),
  path('games/<str:game_id>', GameItemView.as_view(), name='game_item'),

]
