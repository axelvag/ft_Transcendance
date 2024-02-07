from django.urls import path
from . import views
# from invitations import views

urlpatterns = [
    path('home/', views.home, name='home'),
]
