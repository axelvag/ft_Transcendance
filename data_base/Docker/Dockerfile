FROM postgres:16.1-bookworm

USER root

# Créer le répertoire personnalisé pour les données PostgreSQL
RUN mkdir -p /custom_postgres_data

USER postgres

# Copier le script d'initialisation
COPY init.sql /docker-entrypoint-initdb.d/


EXPOSE 5432




# FROM postgres:16.1-bookworm

# # Créer le répertoire personnalisé pour les données PostgreSQL
# RUN mkdir -p /custom_postgres_data

# ENV PGDATA /custom_postgres_data

# # Copier le script d'initialisation
# COPY init.sql /docker-entrypoint-initdb.d/

# EXPOSE 5432







# FROM postgres:16.1-bookworm

# USER root

# # Créer le répertoire personnalisé et définir les permissions
# RUN mkdir -p /custom_postgres_data

# RUN chown -R postgres:postgres /custom_postgres_data

# USER postgres

# # Définir un autre emplacement pour les données PostgreSQL
# # car /var/lib/postgresql/data ne marche pas
# ENV PGDATA /custom_postgres_data

# # RUN mkdir ~/postgres_data

# # RUN chmod -R 777 ~/postgres_data

# # Copiez le fichier SQL d'initialisation dans le conteneur
# COPY init.sql /docker-entrypoint-initdb.d/

# RUN chown postgres:postgres /docker-entrypoint-initdb.d/init.sql

# # # Ajoutez cette ligne pour créer le répertoire de données avec les bons droits
# # RUN mkdir -p /var/lib/postgresql/data && chown -R postgres:postgres /var/lib/postgresql/data

# EXPOSE 5432