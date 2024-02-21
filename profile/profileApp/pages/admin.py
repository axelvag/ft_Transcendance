from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user_id_tableUser', 'firstName', 'lastName', 'icon')
    search_fields = ('firstName', 'lastName')
    list_filter = ('user_id_tableUser',)

# @admin.register(Profile) : C'est un décorateur qui enregistre la classe Profile avec l'administration Django.
# ProfileAdmin : C'est une classe personnalisée d'administration qui hérite de admin.ModelAdmin. Vous pouvez personnaliser l'interface d'administration de votre modèle Profile ici.
# list_display : C'est une tuple qui définit les champs qui seront affichés dans la liste des objets dans l'interface d'administration.
# search_fields : Cela permet la recherche par prénom et nom de famille dans l'interface d'administration.
# list_filter : Cela permet de filtrer les profils dans l'interface d'administration par utilisateur.