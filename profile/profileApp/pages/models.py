from django.db import models
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    user_id_tableUser = models.IntegerField(default=0)
    # icon = models.ImageField(upload_to='icons/')

    def __str__(self):
        return f"{self.firstName} {self.lastName}"