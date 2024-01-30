# Alpine est une distribution Linux legere
FROM nginx:alpine

# # mettre le fichier de configuration nginx.conf dans le container
# COPY ./conf/nginx.conf /etc/nginx/nginx.conf

# mettre le fichier de configuration nginx.conf dans le container
COPY ./public /usr/share/nginx/html

# EXPOSE 8000

# # lance le serveur nginx
# CMD ["nginx", "-g", "daemon off;"]