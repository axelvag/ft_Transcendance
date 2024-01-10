FROM python:3.12-bookworm

# # garantit que le compilateur C est installe avant
# RUN apt-get update && \
#     apt-get install -y gcc libpq-dev && \
#     rm -rf /var/lib/apt/lists/*

# configuration de l'environnement Python qui evite lq creation de fichiers .pyc
ENV PYTHONDONTWRITEBYTECODE 1
# desactiver le buffering de la sortie standard
# assurant que la sortie est immediatement affichee sans délai
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# copie du fichier des dependances dans le conteneur
COPY requirements.txt /app/

# Mise a jour pip et install les dependances
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# copie du contenu de Django de l'appli dans le conteneur
COPY . /app/

EXPOSE 8000

# lancer l'appli Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]