from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from engine.GameEngine import GameEngine

class Game(models.Model):
  STATUS_CHOICES = [
    ('WAITING', 'Waiting'),
    ('READY', 'Ready'),
    ('RUNNING', 'Running'),
    ('PAUSED', 'Paused'),
    ('FINISHED', 'Finished'),
    ('ABORTED', 'Aborted'),
  ]

  player_left_id = models.CharField(max_length=255)
  player_left_score = models.IntegerField(default=0)
  player_right_id = models.CharField(max_length=255)
  player_right_score = models.IntegerField(default=0)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING')
  winner_id = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  ended_at = models.DateTimeField(null=True, blank=True)
  
  def get_id(self):
    return self.id
  
  def json(self):
    return {
      'id': self.id,
      'player_left_id': self.player_left_id,
      'player_left_score': self.player_left_score,
      'player_right_id': self.player_right_id,
      'player_right_score': self.player_right_score,
      'status': self.status,
      'winner_id': self.winner_id,
      'created_at': self.created_at,
      'ended_at': self.ended_at,
    }
  
  def clean(self):
    if self.player_left_id == self.player_right_id:
      raise ValidationError({'player_right_id': 'player_left_id and player_right_id cannot be the same'})

  def save(self, *args, **kwargs):
    self.full_clean()
    return super().save(*args, **kwargs)
  
  # def join(self, player_id):
  #   if self.status != 'WAITING_FOR_PLAYERS':
  #     return
  #   if self.player_left_id == player_id:
  #     self.player_left_connected = True
  #   elif self.player_right_id == player_id:
  #     self.player_right_connected = True
  #   if self.player_left_connected and self.player_right_connected:
  #     self.status = 'READY'
  #   self.save()

  # def leave(self, player_id):
  #   if self.player_left_id == player_id:
  #     self.player_left_connected = False
  #   elif self.player_right_id == player_id:
  #     self.player_right_connected = False
  #   if self.status != 'WAITING_FOR_PLAYERS':
  #     self.status = 'ABORTED'
  #   self.save()

  # def start(self, send_group_fn):
  #   try:
  #     if self.status != 'READY':
  #       return
  #     self.status = 'RUNNING'
  #     self.save()
  #     self.engine = GameEngine()
  #     self.engine.subscribe(send_group_fn)
  #     self.engine.start()
  #   except Exception as e:
  #     self.status = 'ABORTED'
  #     self.save()

  # def stop(self):
  #   if self.status != 'RUNNING':
  #     return
  #   self.status = 'FINISHED'
  #   self.ended_at = timezone.now()
  #   self.winner_id = self.player_left_id if self.player_left_score > self.player_right_score else self.player_right_id
  #   self.save()
  #   self.engine.stop()


