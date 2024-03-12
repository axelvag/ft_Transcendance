from django.db import models

class Game(models.Model):
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  ended_at = models.DateTimeField(null=True, blank=True)
  status = models.CharField(max_length=255)
  player1_id = models.CharField(max_length=255)
  player2_id = models.CharField(max_length=255)
  player1_score = models.IntegerField(default=0)
  player2_score = models.IntegerField(default=0)
  winner_id = models.CharField(max_length=255, null=True, blank=True)
