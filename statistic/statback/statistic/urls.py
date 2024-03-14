from django.urls import path
from . import views

app_name = "statistic"

urlpatterns = [
    path('setter_stat/', views.setter_stat, name='setter_stat'),
    path('getter_stat/<int:user_id>/', views.getter_stat, name='getter_stat'),
]