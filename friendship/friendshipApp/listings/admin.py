# from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import FriendRequest

# Optionnel : Personnaliser l'affichage de votre modèle dans l'administration
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'accepted')
    search_fields = ('from_user__username', 'to_user__username')

# Enregistrer le modèle avec ou sans la personnalisation
admin.site.register(FriendRequest, FriendRequestAdmin)
