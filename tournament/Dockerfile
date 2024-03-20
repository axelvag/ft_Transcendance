FROM python:3.12-bookworm

# configuration de l'environnement Python qui evite lq creation de fichiers .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# desactiver le buffering de la sortie standard
# assurant que la sortie est immediatement affichee sans delai
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# copie du fichier des dependances dans le conteneur
COPY requirements.txt /app/

# Mise a jour pip et install les dependances
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# copie du contenu de Django de l'appli dans le conteneur
COPY . /app/

# COPY ./script_python.sh /app/
# RUN chmod 777 ./script_python.sh



EXPOSE 8005

# WORKDIR /app/auth

# # lancer l'appli Django
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]

WORKDIR /app/auth

# Les droit ne marche pas donc je ne peux pas lancer le script !!!
RUN chmod +x ./script_python.sh

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
CMD ["./script_python.sh"]
# CMD ["ls", "-l", "script_python.sh"]