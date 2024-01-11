# MicroService

## Objective

Separer les fichiers pour que tout soit encapsule dans des modules bien distincts et ainsi les modifier sans ctoucher au reste !

## Folders

DOCKERR-COMPOSE : qui regroupe tout

FRONT :
    - Docker Nginx
    - Les files static (html, js, bootstrap)
    - Node.js pour utiliser npm

BACK :
    - Docker Python
    - Django (requirement.txt, env, auth)

DATA_BASE :
    - Docker PostgreSQL