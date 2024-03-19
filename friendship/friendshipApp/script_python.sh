#!/bin/bash

# Fonction pour attendre que la base de données soit prête
wait_for_db() {
    # Appeler wait-for-it.sh pour attendre que la base de données soit disponible sur le port 5432
    /wait-for-it.sh -t 60 data_base:5432 -- echo "La base de données est prête"
}

# Attendre que la base de données soit disponible
wait_for_dbsh -t 60 data_base:5432 -- echo "La base de données est prête"

# sleep 120

# Pour utiliser Postgres
python3 manage.py makemigrations

# Exécuter les migrations
python3 manage.py migrate

# Lancer l'application Django
python3 manage.py runserver 0.0.0.0:8003