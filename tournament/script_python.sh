#!/bin/bash

set -e

# Pour utiliser Postgres
python3 manage.py makemigrations

# Exécuter les migrations
python3 manage.py migrate

# Lancer l'application Django
# python3 manage.py runserver 0.0.0.0:8005
daphne -e ssl:8005:privateKey=/etc/ssl/private/nginx-selfsigned.key:certKey=/etc/ssl/certs/nginx-selfsigned.crt tournament.asgi:application