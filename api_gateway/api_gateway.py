from flask import Flask, request, jsonify, abort
from werkzeug.exceptions import HTTPException
import logging
import yaml
import requests

app = Flask(__name__)

with open('/app/api_gateway/config/routing.yaml', 'r') as file:
    routing_config = yaml.safe_load(file)

with open('/app/api_gateway/config/rate_limiting.yaml', 'r') as file:
    rate_limiting_config = yaml.safe_load(file)

from middleware import logging, error_handling

app.register_blueprint(logging.logging_bp)
app.register_error_handler(HTTPException, error_handling.handle_http_exception)

def get_service_url(route):
    service_url = routing_config.get(route)
    # service_url = "http://127.0.0.1:8002/pages"
    # if not service_url:
    #     app.logger.error(f"No service found for route: {route}")
    #     return None

    app.logger.debug(f"Route: {route}, Service URL: {service_url}")
    return service_url

def forward_request(service_url, route, request):
    # Ne pas ajouter "/profile" à la fin de l'URL
    forward_url = f"{service_url}"

    # app.logger.debug(f"SERVICE URL {service_url}")
    # app.logger.debug(f"ROUTE {route}")
    # app.logger.debug(f"REQUEST.PATH {request.path}")
    app.logger.debug(f"Forwarding request to {forward_url}")
    app.logger.debug(f"22222222222222222")

    try:
        app.logger.debug(f"request.Methode {request.method}")
        app.logger.debug(f"forward_url {forward_url}")
        app.logger.debug(f"request.headers {request.headers}")
        app.logger.debug(f"request.get_data() {request.get_data()}")
        app.logger.debug(f"request.args {request.args}")

        response = requests.request(
            method=request.method,
            url=forward_url,
            headers=request.headers,
            data=request.get_data(),
            params=request.args,
        )
        app.logger.debug(f"333333333333333333 {response}")
        return response.content, response.status_code, response.headers.items()
    except requests.RequestException as e:
        # app.logger.exception("An error occurred during request forwarding:")
        # app.logger.debug(f"method {method}")
        # app.logger.debug(f"url {url}")
        # app.logger.debug(f"headers {headers}")
        # app.logger.debug(f"data {data}")
        # app.logger.debug(f"params {params}")
        abort(500, f"Failed to forward request to {forward_url} : {str(e)}")

@app.route('/<path:route>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(route):
    service_url = get_service_url(route)
    # app.logger.debug("111111111111111111")
    # app.logger.debug(f"service_url: {service_url}")
    if not service_url:
        app.logger.error(f"No service found for route: {route}")
        abort(404, f"No service found for route: {route}")


    response_data, status_code, headers = forward_request(service_url, route, request)

    # Create a Flask response object to return to the client
    response = jsonify(response_data)
    response.status_code = status_code
    for key, value in headers:
        response.headers[key] = value

    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)




# # api_gateway.py
# from flask import Flask, request
# from werkzeug.exceptions import HTTPException
# import logging
# import yaml

# # import os
# # # Imprimez le répertoire de travail actuel
# # print("Current working directory:", os.getcwd())

# # Creer l'API Flask
# app = Flask(__name__)

# # Chargement des fichiers de config
# with open('/app/api_gateway/config/routing.yaml', 'r') as file:
#     routing_config = yaml.safe_load(file)

# # with open('/authentication.yaml', 'r') as file:
# #     authentication_config = yaml.safe_load(file)

# with open('/app/api_gateway/config/rate_limiting.yaml', 'r') as file:
#     rate_limiting_config = yaml.safe_load(file)

# # Application des middlewares
# from middleware import logging, error_handling

# # Enregistrement des blueprints (modele) pour les middlewares
# app.register_blueprint(logging.logging_bp)
# app.register_error_handler(HTTPException, error_handling.handle_http_exception)

# # Define route for each service based on routing configuration
# for route, service_url in routing_config.items():
#     endpoint_name = f"proxy_{route}"  # Utilisez un nom d'endpoint unique pour chaque route
#     @app.route(route, methods=['GET', 'POST', 'PUT', 'DELETE'], endpoint=endpoint_name)
#     def proxy(route=route, service_url=service_url):
#         # Implement logic to forward requests to the appropriate service
#         # This can involve authentication, rate limiting, etc.
#         pass

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)
