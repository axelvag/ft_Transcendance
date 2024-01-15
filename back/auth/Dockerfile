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
# !!!! Je dois copier le reste de /auth

EXPOSE 8000

WORKDIR /app/auth


CMD ["python3", "manage.py", "migrate"]

# lancer l'appli Django
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
