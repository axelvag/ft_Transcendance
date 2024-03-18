from django.urls import path
from . import views
# from invitations import views

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('send_invitation/', views.send_invitation, name='send_invitation'),
    path('notifications/', views.notifications, name='notifications'),
    path('accept_invitation/', views.accept_invitation, name='accept_invitation'),
    path('get_friends/', views.get_friends, name='get_friends'),
]