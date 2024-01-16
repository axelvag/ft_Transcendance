# Dockerfile du service dashboard

FROM python:3.12-bookworm

# Autres configurations du Dockerfile

WORKDIR /app

# Copie des fichiers de l'application
COPY . /app/
# COPY ./authentification/auth/ /app/

# WORKDIR /

# COPY ./authentification/auth/ /app/auth/

# Exposer le port sur lequel l'application Django écoute à l'intérieur du conteneur
EXPOSE 8000

# Commande pour lancer l'application Django
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

# CMD ["tail", "-f", "/dev/null"]
