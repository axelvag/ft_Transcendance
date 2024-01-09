from django.db import models

# Create your models here.
class Person(models.Model):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(verbose_name='adresse email', max_length=255, unique=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)