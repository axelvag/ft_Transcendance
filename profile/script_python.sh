#!/bin/bash

set -e

# Pour utiliser Postgres
python3 manage.py makemigrations

# Exécuter les migrations
python3 manage.py migrate

# Lancer l'application Django
# python3 manage.py runserver 0.0.0.0:8002
# gunicorn -c /profileApp/gunicorn.conf.py
daphne -e ssl:8002:privateKey=/etc/ssl/private/nginx-selfsigned.key:certKey=/etc/ssl/certs/nginx-selfsigned.crt profileApp.asgi:application