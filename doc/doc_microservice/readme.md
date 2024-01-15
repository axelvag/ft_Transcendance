# MicroService

> axel

## Objective

Separate the files so that everything is encapsulated in very distinct modules and thus modify them without touching the rest!

## Folders

DOCKER-COMPOSE: which brings together everything

SERVER :
    - Docker Nginx
    - Static files (html, js, bootstrap)
    - Node.js to use npm

AUTHENTIFICATION:
    - Docker Python
    - Django (requirement.txt, env, auth)

DATA_BASE:
    - Docker PostgreSQL