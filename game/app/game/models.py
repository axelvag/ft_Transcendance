from django.db import models
import json
from django.core.exceptions import ValidationError

class Game(models.Model):
  STATUS_CHOICES = [
    ('PENDING', 'Pending'),
    ('IN_PROGRESS', 'In Progress'),
    ('COMPLETED', 'Completed'),
    ('CANCELLED', 'Cancelled'),
  ]

  created_at = models.DateTimeField(auto_now_add=True)
  ended_at = models.DateTimeField(null=True, blank=True)
  player_left_id = models.CharField(max_length=255)
  player_right_id = models.CharField(max_length=255)
  player1_score = models.IntegerField(default=0)
  player2_score = models.IntegerField(default=0)
  winner_id = models.CharField(max_length=255, null=True, blank=True)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
  
  def get_id(self):
    return self.id
  
  def json(self):
    return {
      'id': self.id,
      'player_left_id': self.player_left_id,
      'player_right_id': self.player_right_id,
      'status': self.status,
      'winner': self.winner_id,
      'created_at': self.created_at,
      'ended_at': self.ended_at,
    }
  
  def clean(self):
    if self.player_left_id == self.player_right_id:
      raise ValidationError({'player_right_id': 'player_left_id and player_right_id cannot be the same'})

  def save(self, *args, **kwargs):
    self.full_clean()
    return super().save(*args, **kwargs)
