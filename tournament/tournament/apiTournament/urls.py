from django.urls import path
from . import views

app_name = "tournament"

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    path('view/', views.view, name='view'),
    path('get/<int:tournament_id>/', views.tournament_detail, name='tournament_detail'),
    path('create_joueur/', views.create_joueur, name='create_joueur'),
    path('get_player/<int:tournament_id>/', views.view_joueur, name='view_joueur'),
    path('delete_joueur/<int:user_id>/', views.delete_joueur, name='delete_joueur'),
    path('tournoi_info/<int:user_id>/', views.tournoi_info, name='tournoi_info'),
    path('delete_tournment/<int:tournoi_id>/', views.delete_tournoi, name='delete_tournoi'),
]