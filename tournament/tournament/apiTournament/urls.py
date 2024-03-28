from django.urls import path
from . import views

app_name = "tournament"

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    path('view/', views.view, name='view'),
    path('get/<int:tournament_id>/', views.tournament_detail, name='tournament_detail'),
]