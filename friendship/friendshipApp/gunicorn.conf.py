"""Gunicorn *production* config file"""

# Application to run
wsgi_app = 'friendshipApp.wsgi:application'

# Bind address and port
bind = '0.0.0.0:8003'

# Number of workers
workers = 3

# chdir = 'auth/'

daemon = False

keyfile = '/etc/ssl/private/nginx-selfsigned.key'

certfile = '/etc/ssl/certs/nginx-selfsigned.crt'