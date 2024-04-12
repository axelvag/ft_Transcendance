"""Gunicorn *production* config file"""

# Application to run
wsgi_app = 'profileApp.wsgi:application'

# Bind address and port
bind = '0.0.0.0:8002'

# Number of workers
workers = 4

# chdir = 'profileApp/'

daemon = False

keyfile = '/etc/ssl/private/nginx-selfsigned.key'

certfile = '/etc/ssl/certs/nginx-selfsigned.crt'