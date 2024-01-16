# Utilisez une image Nginx légère
FROM nginx:alpine

# Copiez le contenu du dossier "dashboard" dans le répertoire par défaut d'Nginx
COPY . /usr/share/nginx/html

# Exposez le port spécifié dans le docker-compose.yml pour ce service
EXPOSE 8002

# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]