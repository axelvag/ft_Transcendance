# build
FROM node:18.19.0 as build

WORKDIR /app
COPY ./app/package*.json ./
RUN npm install

RUN npm install dotenv

COPY ./app .
RUN npm run build

# serve
FROM nginx:1.25.3
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

RUN apt update -y && \
    apt upgrade -y && \
    apt install -y openssl && \
    rm -rf /var/lib/apt/lists/*

#avoir le certificat ssl, -x509 pour certificat auto-signé, -newkey pour générer une nouvelle clé privée rsa, -nodes pour ne pas crypter la clé privée
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=FR/ST=RHONE/L=LYON/O=42 lyon/OU=42/CN=127.0.0.1/UID=avaganay"

# Ajouter la configuration de redirection de port
RUN echo "Source: * Port: 443 TO Destination: server-IP Port: 443" >> /etc/port_forwarding.conf

EXPOSE 8443
CMD ["nginx", "-g", "daemon off;"]
# CMD ["tail", "-f", "/dev/null"]