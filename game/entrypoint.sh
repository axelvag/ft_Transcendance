#!/bin/bash

set -e

# Migrate database
python3 manage.py makemigrations
python3 manage.py migrate

# Create superuser
python3 manage.py createsuperuser --noinput || true

# Start server
python3 manage.py runserver 0.0.0.0:8009
# daphne -e ssl:8009:privateKey=/etc/ssl/private/nginx-selfsigned.key:certKey=/etc/ssl/certs/nginx-selfsigned.crt game.asgi:application