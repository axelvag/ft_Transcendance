from flask import Flask, request, jsonify, abort, redirect
from werkzeug.exceptions import HTTPException
import logging
import yaml
import requests
import base64

app = Flask(__name__)

with open('/app/api_gateway/config/routing.yaml', 'r') as file:
    routing_config = yaml.safe_load(file)

with open('/app/api_gateway/config/rate_limiting.yaml', 'r') as file:
    rate_limiting_config = yaml.safe_load(file)

from middleware import logging, error_handling

app.register_blueprint(logging.logging_bp)
app.register_error_handler(HTTPException, error_handling.handle_http_exception)

# debug
@app.route('/Home')
def home():
    import pdb; pdb.set_trace()

# Si 127.0.0.1:5000 redirige vers 127.0.0.1:5000/authentification
@app.route('/')
def redirect_to_authentication():
    return redirect('/authentification')

def get_service_url(route):
    service_url = routing_config.get(route)

    # Modifiez cette ligne pour utiliser le nom du service
    # service_url = "http://transcendance-authentification-1:8001"

    app.logger.debug(f"Route: {route}, Service URL: {service_url}")
    return service_url

def forward_request(service_url, route, request):
    # Ne pas ajouter "/profile" à la fin de l'URL
    forward_url = f"{service_url}"

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

        # Convertir les données de type bytes en str pour jsonify
        # Pour fixe une erreur "TypeError: Object of type bytes is not JSON serializable"
        response_data = response.content.decode('utf-8')

        return response_data, response.status_code, response.headers.items()
    except requests.RequestException as e:
        abort(500, f"Failed to forward request to {forward_url} : {str(e)}")
00, f"Failed to forward request to {forward_url} : {str(e)}")


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
