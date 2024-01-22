# Alpine est une distribution Linux legere
FROM nginx:alpine

# mettre le fichier de configuration nginx.conf dans le container
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# lance le serveur nginx
CMD ["nginx", "-g", "daemon off;"]