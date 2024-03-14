#!/bin/bash

# Pour utiliser Postgres
python3 manage.py makemigrations

# Exécuter les migrations
python3 manage.py migrate

# Lancer l'application Django
python3 manage.py runserver 0.0.0.0:8002