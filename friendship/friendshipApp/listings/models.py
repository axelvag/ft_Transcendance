from django.db import models
from django.conf import settings

# Create your models here.

class FriendRequest(models.Model):
    # Un utilisateur peut envoyer une demande à un autre utilisateur
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='to_user', on_delete=models.CASCADE)
    # Un booléen pour déterminer si la demande a été acceptée
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.from_user} to {self.to_user}"
