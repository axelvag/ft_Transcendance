#!/bin/bash

set -e

# Pour utiliser Postgres
python3 manage.py makemigrations

# Exécuter les migrations
python3 manage.py migrate

# Lancer l'application Django
# python3 manage.py runserver 0.0.0.0:8001
gunicorn -c /auth/gunicorn.conf.py