from django.urls import path
from . import views

app_name = "statistic"

urlpatterns = [
    path('update_stat/', views.update_stat, name='update_stat'),
]