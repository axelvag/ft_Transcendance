from django.contrib import admin

# Register your models here.

# from django.contrib import admin
from .models import Invitation

# @admin.register(Invitation) # enregistre dans le systeme d'administration django
# class InvitationAdmin(admin.ModelAdmin):
#     list_display = ('from_user', 'to_email', 'accepted')
