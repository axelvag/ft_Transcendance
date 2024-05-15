from django.urls import path
from . import views
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('send_invitation/', views.send_invitation, name='send_invitation'),
    path('accept_invitation/', views.accept_invitation, name='accept_invitation'),
    path('reject_invitation/', views.reject_invitation, name='reject_invitation'),
    path('list_received_invitations/<int:user_id>/', views.list_received_invitations, name='list_received_invitations'),
    path('list_sent_invitations/<int:user_id>/', views.list_sent_invitations, name='list_sent_invitations'),
    path('cancel_sent_invitation/', views.cancel_sent_invitation, name='cancel_sent_invitation'),
    path('remove_friend/', views.remove_friend, name='remove_friend'),
    path('online_friends/<int:user_id>/', views.online_friends, name='online_friends'),
    path('offline_friends/<int:user_id>/', views.offline_friends, name='offline_friends'),
    path('search_users/', views.search_users, name='search_users'),
    path('get_profile_info/<int:user_id>/', views.get_profile_info, name='get_profile_info'),
    path('delete_user_data/<int:user_id>/', views.delete_user_data, name='delete_user_data'),
    path('get_friends/<int:user_id>/', views.get_friends, name='get_friends'),
]