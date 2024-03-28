from django.db import models

# Create your models here.
class Tournoi(models.Model):
    CREATED = 0
    IN_PROGRESS = 1
    FINISHED = 2

    name = models.CharField(max_length=100)
    # matchs = models.ManyToManyField(Match)
    status = models.BooleanField(default=CREATED)
    max_players = models.IntegerField(default=16, blank=True)
    start_datetime = models.DateTimeField(null=True)

class Joueur(models.Model):
    username = models.CharField(max_length=100)
    user_id = models.IntegerField()
    tournament = models.ForeignKey(Tournoi, on_delete=models.CASCADE, related_name='players')

class Match(models.Model):
    player_1 = models.ForeignKey(Joueur, related_name='player_1', on_delete=models.CASCADE)
    player_1_score = models.IntegerField(null=True)
    player_2 = models.ForeignKey(Joueur, related_name='player_2', on_delete=models.CASCADE)
    player_2_score = models.IntegerField(null=True)
    winner = models.ForeignKey(Joueur, related_name='won_games', on_delete=models.SET_NULL, null=True, blank=True)
    tour = models.IntegerField(default=1)  # Pour suivre le tour du match dans le tournoi
    match_id = models.IntegerField()
    status = models.IntegerField(default=0)
