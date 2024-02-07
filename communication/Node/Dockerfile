# Utilise une image de base avec Node.js préinstallé
FROM node:16

# Définit le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie le fichier package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers du projet
COPY . .

# Expose le port mais pas besoin car dans le docker-compose
# EXPOSE 3000

# lance npm start
CMD [ "npm", "start" ]