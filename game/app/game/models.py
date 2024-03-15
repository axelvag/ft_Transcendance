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
  player1_id = models.CharField(max_length=255)
  player2_id = models.CharField(max_length=255)
  player1_score = models.IntegerField(default=0)
  player2_score = models.IntegerField(default=0)
  winner_id = models.CharField(max_length=255, null=True, blank=True)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
  
  def get_id(self):
    return self.id
  
  def json(self):
    return {
      'id': self.id,
      'player1_id': self.player1_id,
      'player2_id': self.player2_id,
      'status': self.status,
      'winner': self.winner_id,
      'created_at': self.created_at,
      'ended_at': self.ended_at,
    }
  
  def clean(self):
    if self.player1_id == self.player2_id:
      raise ValidationError({'player2_id': 'player1_id and player2_id cannot be the same'})

  def save(self, *args, **kwargs):
    self.full_clean()
    return super().save(*args, **kwargs)
