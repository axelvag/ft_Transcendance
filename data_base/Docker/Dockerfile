FROM postgres:16.1-bookworm

USER root

# Créer le répertoire personnalisé pour les données PostgreSQL
RUN mkdir -p /custom_postgres_data

USER postgres

# Copier le script d'initialisation
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
