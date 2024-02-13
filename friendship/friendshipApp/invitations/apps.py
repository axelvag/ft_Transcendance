from django.apps import AppConfig


class InvitationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'invitations'

# config une app Django nomme 'invitation', avec des field BigAutoField pour gerer de grand input