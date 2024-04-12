"""Gunicorn *production* config file"""

# Application to run
wsgi_app = 'auth.wsgi:application'

# Bind address and port
bind = '0.0.0.0:8001'

# Number of workers
workers = 4

# chdir = 'auth/'

daemon = False

keyfile = '/etc/ssl/private/nginx-selfsigned.key'

certfile = '/etc/ssl/certs/nginx-selfsigned.crt'