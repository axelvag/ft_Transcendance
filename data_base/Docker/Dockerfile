FROM postgres:16.1-bookworm

USER root

RUN mkdir ~/postgres_data

RUN chmod -R 777 ~/postgres_data

# Copiez le fichier SQL d'initialisation dans le conteneur
COPY init.sql /docker-entrypoint-initdb.d/

RUN chown postgres:postgres /docker-entrypoint-initdb.d/init.sql

# Ajoutez cette ligne pour créer le répertoire de données avec les bons droits
RUN mkdir -p /var/lib/postgresql/data && chown -R postgres:postgres /var/lib/postgresql/data

USER postgres

EXPOSE 5432