from django.urls import path
from . import views

app_name = "tournament"

urlpatterns = [
    path('create_tournament/', views.create_tournament, name='create_tournament'),
]