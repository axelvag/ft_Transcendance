# Utilisez une image de base avec Python
FROM python:3.8

# Définissez le répertoire de travail
WORKDIR /app

# Copiez le contenu du répertoire local dans le conteneur à /app
COPY . /app

# Installez les dépendances (Django)
RUN pip install --no-cache-dir -r requirements.txt

# Exposez le port 4000 sur lequel Django sera en cours d'exécution
EXPOSE 4000

# Commande pour démarrer le serveur Django lorsqu'un conteneur est lancé
CMD ["python", "manage.py", "runserver", "0.0.0.0:4000"]
