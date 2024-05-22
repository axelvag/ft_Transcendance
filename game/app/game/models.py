from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import requests

class Game(models.Model):
  STATUS_CHOICES = [
    ('WAITING', 'Waiting'),
    ('RUNNING', 'Running'),
    ('FINISHED', 'Finished'),
    ('ABORTED', 'Aborted')
  ]

  player_left_id = models.CharField(max_length=255)
  player_left_score = models.IntegerField(default=0)
  player_left_connected = models.BooleanField(default=False)
  player_left_forfeit = models.BooleanField(default=False)

  player_right_id = models.CharField(max_length=255)
  player_right_score = models.IntegerField(default=0)
  player_right_connected = models.BooleanField(default=False)
  player_right_forfeit = models.BooleanField(default=False)

  match_id = models.CharField(max_length=255, null=True, blank=True)
  
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING')
  winner_id = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  ended_at = models.DateTimeField(null=True, blank=True)
  
  def json(self):
    return {
      'id': self.id,
      'player_left_id': self.player_left_id,
      'player_left_score': self.player_left_score,
      'player_left_connected': self.player_left_connected,
      'player_left_forfeit': self.player_left_forfeit,
      'player_right_id': self.player_right_id,
      'player_right_score': self.player_right_score,
      'player_right_connected': self.player_right_connected,
      'player_right_forfeit': self.player_right_forfeit,
      'match_id': self.match_id,
      'status': self.status,
      'winner_id': self.winner_id,
      'created_at': self.created_at.strftime('%Y-%m-%dT%H:%M:%S'),
      'ended_at': self.ended_at.strftime('%Y-%m-%dT%H:%M:%S') if self.ended_at else None,
    }
  
  def clean(self):
    if self.player_left_id == self.player_right_id:
      raise ValidationError({'player_right_id': 'player_left_id and player_right_id cannot be the same'})

  def save(self, *args, **kwargs):
    self.full_clean()
    return super().save(*args, **kwargs)
  
  def join(self, player_id):
    self.refresh_from_db()
    if self.status != 'WAITING':
      return False
    if self.player_left_id == player_id:
      self.player_left_connected = True
    elif self.player_right_id == player_id:
      self.player_right_connected = True
    if self.player_left_connected and self.player_right_connected:
      self.status = 'RUNNING'
    self.save()
    return True

  def leave(self, player_id, sessionid):
    self.refresh_from_db()
    if self.status == 'FINISHED' or self.status == 'ABORTED':
      return
    if self.player_left_id == player_id:
      self.player_left_connected = False
      opponent_id = self.player_right_id
    elif self.player_right_id == player_id:
      self.player_right_connected = False
      opponent_id = self.player_left_id
    self.status = 'FINISHED'
    self.ended_at = timezone.now()
    self.winner_id = opponent_id
    self.player_left_forfeit = (self.player_left_id == player_id)
    self.player_right_forfeit = (self.player_right_id == player_id)
    self.save()
    if (self.match_id != None):
      print("update winnerrrrrrrrrrrrrrrrrrrrr leaveeeeeeeeeeeeeeeeeeeeee")
      self.send_tournament_winner(sessionid)

  def end(self, data):
    self.refresh_from_db()
    if self.status != 'RUNNING':
      return False
    if data is None:
      return False
    winner_id = data.get('winner_id', None)
    if winner_id not in [self.player_left_id, self.player_right_id]:
      return False
    self.status = 'FINISHED'
    self.ended_at = timezone.now()
    self.winner_id = winner_id
    self.player_left_score = data.get('player_left_score', self.player_left_score)
    self.player_left_forfeit = data.get('player_left_forfeit', False)
    self.player_right_score = data.get('player_right_score', self.player_right_score)
    self.player_right_forfeit = data.get('player_right_forfeit', False)
    self.save()
    if (self.match_id != None):
      print("update winnerrrrrrrrrrrrrrrrrrrrr enddddddddddddddddd")
      self.send_tournament_winner(data.get('sessionid', None))

  def send_tournament_winner(self, sessionid):
    self.refresh_from_db()
    try:
      request_url = f"https://tournament:8005/tournament/update_winner/{self.match_id}/{self.winner_id}/{self.player_left_score}/{self.player_right_score}/"
      response = requests.post(request_url, cookies={'sessionid': sessionid}, verify=False)
      response.raise_for_status()
    except requests.RequestException as e:
      return
    except Exception as e:
      return