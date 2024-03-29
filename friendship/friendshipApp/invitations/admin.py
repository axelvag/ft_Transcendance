from django.contrib import admin
from .models import Friendship, Invitation, Notification, UserStatus

# Enregistrez vos modèles ici pour les rendre visibles dans l'interface d'administration.

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'friend', 'created_at')
    search_fields = ('user__username', 'friend__username')

@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'accepted', 'sent_at')
    list_filter = ('accepted',)
    search_fields = ('from_user__username', 'to_user__username')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'seen', 'created_at', 'delivered')
    list_filter = ('seen', 'delivered')
    search_fields = ('user__username', 'message')

@admin.register(UserStatus)
class UserStatusAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_online', 'last_seen')
    list_filter = ('is_online',)
    search_fields = ('user__username',)
