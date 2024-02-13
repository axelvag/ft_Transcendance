# Create your models here.

from django.db import models
from django.conf import settings
from django.utils import timezone

# Modele : permettent de définir la structure des données de votre application de manière claire et concise

class Invitation(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='invitations_sent', on_delete=models.CASCADE)
    # to_email = models.EmailField()
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invitations_received', null=True, blank=True)
    to_email = models.EmailField(blank=True, null=True)
    accepted = models.BooleanField(default=False)
    sent_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        if self.to_user:
            return f"{self.from_user} invites {self.to_user.username}"
        else:
            return f"{self.from_user} invites {self.to_email}"


# ForeignKey : lie chaque invitation a un utilisateur
# settings.AUTH_USER_MODEL  :referencie le modele
# on_delete=models.CASCADE signifie que si l'utilisateur qui a envoyé l'invitation est supprimé, toutes les invitations qu'il a envoyées seront également supprimées de la base de données.