#!/bin/bash

docker compose run --rm authentification python manage.py makemigrations
docker compose run --rm authentification python manage.py migrate

docker stop authentification
docker start authentification
docker stop friendship
docker start friendship
docker stop profile
docker start profile

# echo "SUCCESS"