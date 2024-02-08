# Create your models here.

from django.db import models
from django.conf import settings

class Invitation(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='invitations_sent', on_delete=models.CASCADE)
    # to_email = models.EmailField()
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invitations_received', null=True, blank=True)
    to_email = models.EmailField(blank=True, null=True)
    accepted = models.BooleanField(default=False)

    # def __str__(self):
    #     return f"{self.from_user} invites {self.to_email}"
    def __str__(self):
        if self.to_user:
            return f"{self.from_user} invites {self.to_user.username}"
        else:
            return f"{self.from_user} invites {self.to_email}"
