#!/bin/bash

set -e

# Migrate database
python3 manage.py makemigrations
python3 manage.py migrate

# Create superuser
python3 manage.py createsuperuser --noinput || true

# Start server
python3 manage.py runserver 0.0.0.0:8009