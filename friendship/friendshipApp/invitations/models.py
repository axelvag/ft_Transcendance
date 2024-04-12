# Create your models here.

from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.utils.timezone import now

User = get_user_model()

class Friendship(models.Model):
    user = models.ForeignKey(User, related_name='friendships', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Invitation(models.Model):
    from_user = models.ForeignKey(User, related_name='invitations_sent', on_delete=models.CASCADE, null=True)
    to_user = models.ForeignKey(User, related_name='invitations_received', on_delete=models.CASCADE, null=True)
    accepted = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    invitation = models.ForeignKey(Invitation, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    delivered = models.BooleanField(default=False)

class UserStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='status')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=now)

    # def __str__(self):
    #     return f"{self.user.username} is {'online' if self.is_online else 'offline'}"