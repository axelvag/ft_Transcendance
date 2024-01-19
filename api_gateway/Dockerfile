# Utilisez une image de base légère avec Python
FROM python:3.9-slim

# Définissez le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez le contenu de votre répertoire API Gateway dans le conteneur
COPY . /app/api_gateway

# Installez les dépendances
RUN pip install --no-cache-dir -r /app/api_gateway/requirements.txt

# Exposez le port sur lequel votre application Flask s'exécute
EXPOSE 5000

# Commande pour exécuter votre API Gateway
CMD ["python", "/app/api_gateway/api_gateway.py"]