# build
FROM node:18.19.0 as build

RUN apt update -y && \
    apt upgrade -y && \
    apt install -y openssl && \
    rm -rf /var/lib/apt/lists/*

#avoir le certificat ssl, -x509 pour certificat auto-signé, -newkey pour générer une nouvelle clé privée rsa, -nodes pour ne pas crypter la clé privée
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=FR/ST=RHONE/L=LYON/O=42 lyon/OU=42/CN=avaganay.42.fr/UID=avaganay"

WORKDIR /app
COPY ./app/package*.json ./
RUN npm install

COPY ./app .
RUN npm run build

# serve
FROM nginx:1.25.3
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]