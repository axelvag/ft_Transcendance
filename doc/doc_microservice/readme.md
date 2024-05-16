# MicroService

> axel

## Objective

Separate the files so that everything is encapsulated in very distinct modules and thus modify them without touching the rest!

## PATH Idea

Je n'ai pas arreter de changer ma structure des microservices en SPA a force de me documenter
voici l'une des premieres version avant d'avoir le resultat actuel:

![image_microservice](../image/microservices.png)

## Folders

DOCKER-COMPOSE: which brings together everything

FRONT :
    - Docker Nginx
    - SPA (html, js, bootstrap)

AUTHENTIFICATION:
    - Docker Python Daphnee
    - Django (requirement.txt, env, auth)

PROFILE:
    - Docker Python Daphnee
    - Django (requirement.txt, env, profileApp)

FRIENDSHIP:
    - Docker Python Daphnee
    - Django (requirement.txt, env, friendshipApp)

GAME:
    - Docker Python Daphnee
    - Django (requirement.txt, env, app)

TOURNAMENT:
    - Docker Python Daphnee
    - Django (requirement.txt, env, tournament)

DATA_BASE:
    - Docker PostgreSQL
