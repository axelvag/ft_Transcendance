FROM postgres:16.0-bookworm

# Copie du fichier de configuration PostgreSQL
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Configuration pour autoriser les connexions depuis n'importe quelle adresse IP (ATTENTION: Cela peut être une faille de sécurité)
# RUN echo "listen_addresses = '*'" >> /etc/postgresql/postgresql.conf

# Configuration pour accepter les connexions à partir de n'importe quelle origine (CORS) - cet exemple n'est pas applicable à PostgreSQL mais pour des serveurs HTTP
# RUN echo "cors_allowed_origins = '*'" >> /etc/postgresql/postgresql.conf

EXPOSE 5432
