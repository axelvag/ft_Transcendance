FROM python:3.12-bookworm

# configuration de l'environnement Python qui evite lq creation de fichiers .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# desactiver le buffering de la sortie standard
# assurant que la sortie est immediatement affichee sans delai
ENV PYTHONUNBUFFERED 1

# RUN mkdir /app
WORKDIR /app

# copie du fichier des dependances dans le conteneur
COPY requirements.txt /app/

# Mise a jour pip et install les dependances
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# copie du contenu de Django de l'appli dans le conteneur
COPY . /app/

EXPOSE 8000

WORKDIR /app/auth

# Faire un script !!!

# CMD ["python3", "manage.py", "migrate"]

# lancer l'appli Django
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

# FROM python:3.12-bookworm

# # configuration de l'environnement Python qui evite lq creation de fichiers .pyc
# ENV PYTHONDONTWRITEBYTECODE 1
# # desactiver le buffering de la sortie standard
# # assurant que la sortie est immediatement affichee sans delai
# ENV PYTHONUNBUFFERED 1

# # RUN mkdir /app
# WORKDIR /app

# # copie du fichier des dependances dans le conteneur
# COPY requirements.txt /app/

# # Mise a jour pip et install les dependances
# RUN pip install --upgrade pip \
#     && pip install --no-cache-dir -r requirements.txt

# # copie du contenu de Django de l'appli dans le conteneur
# COPY . /app/

# EXPOSE 8000


# # Copier le script start.sh
# COPY ./conf/script_docker.sh /app/

# # Donner les permissions d'exécution au script
# RUN chmod +x /app/script_docker.sh

# WORKDIR /app/auth

# # Utiliser le script comme CMD
# CMD ["./script_docker.sh"]

# # Faire un script !!!

# # CMD ["python3", "manage.py", "migrate"]

# # # lancer l'appli Django
# # CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
