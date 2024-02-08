from django.urls import path
from . import views
# from invitations import views

urlpatterns = [
    path('home/', views.home, name='home'),
    # path('accept/<int:invitation_id>/', views.accept_invitation, name='accept_invitation'),
    # path('reject/<int:invitation_id>/', views.reject_invitation, name='reject_invitation'),
]