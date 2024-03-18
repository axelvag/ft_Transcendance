from django.db import models
from django.conf import settings


class Profile(models.Model):
    user_id = models.IntegerField(null=True)
    firstName = models.CharField(max_length=100, verbose_name="First Name", null=True)
    lastName = models.CharField(max_length=100, verbose_name="Last Name", null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    # avatar = models.ImageField(upload_to='avatars/', default='avatars/default-profile.jpg')


    def __str__(self):
        return f"{self.firstName} {self.lastName}"