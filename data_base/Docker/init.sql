-- Creer un utilisateur
CREATE USER myuser WITH PASSWORD 'mypassword';

-- Creer une data base et attribuez-la au user
CREATE DATABASE mydatabase;
ALTER DATABASE mydatabase OWNER TO myuser;