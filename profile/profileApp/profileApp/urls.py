"""
URL configuration for profileApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from pages import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('update_user/', views.update_user, name='update_user'),
]

# Dans votre fichier urls.py
# from django.urls import path
# from .views import update_user
# from django.contrib import admin

# urlpatterns = [
#     path('update_user/', update_user, name='update_user'),
#     # ... autres routes ...
# ]
