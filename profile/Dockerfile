# Dockerfile du service profile

FROM python:3.12-bookworm

# Autres configurations du Dockerfile

WORKDIR /app

COPY requirements.txt /app/

# # Pour fix le probleme backports.zoneinfo
# RUN pip install --upgrade pip setuptools wheel

# Mise a jour pip et install les dependances
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copie des fichiers de l'application
COPY . /app/
# COPY ./authentification/auth/ /app/

# WORKDIR /

# COPY ./authentification/auth/ /app/auth/

# Exposer le port sur lequel l'application Django écoute à l'intérieur du conteneur
EXPOSE 8002

WORKDIR /app/dashback

# Commande pour lancer l'application Django
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8002"]

# CMD ["tail", "-f", "/dev/null"]
