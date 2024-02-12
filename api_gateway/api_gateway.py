from flask import Flask, request, jsonify, abort, redirect, Response
from werkzeug.exceptions import HTTPException
import logging
import yaml
import requests
import base64
# from flask_cors import CORS  # Importez l'extension CORS

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})  # Activez CORS pour toutes les routes


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
        response = requests.request(
            method=request.method,
            url=forward_url,
            headers={
                'Accept': 'application/json',  # Spécifiez que vous attendez une réponse JSON
                'Content-Type': 'application/json',
                **request.headers,  # Passez les autres en-têtes de la requête d'origine
            },
            data=request.get_data(),
            params=request.args,
        )
        
        # Vérifier si la demande a réussi
        response.raise_for_status()

        response_data_raw = response.content
        app.logger.debug(f"Raw response data: {response_data_raw}")

        # Vérifier le type de contenu de la réponse
        content_type = response.headers.get('content-type', '').lower()

        if 'json' in content_type:
            # Si la réponse est au format JSON, décoder en UTF-8 comme auparavant
            response_data = response_data_raw.decode('utf-8')
        else:
            # Sinon, renvoyer les données brutes
            response_data = response_data_raw

        return response_data, response.status_code, response.headers.items()
    except requests.RequestException as e:
        abort(500, f"Failed to forward request to {forward_url} : {str(e)}")



@app.route('/<path:route>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(route):
    service_url = get_service_url(route)
    if not service_url:
        app.logger.error(f"No service found for route: {route}")
        abort(404, f"No service found for route: {route}")

    response_data, status_code, headers = forward_request(service_url, route, request)

    # Créez un objet Flask Response pour renvoyer au client
    if isinstance(response_data, bytes):
        # Si les données sont des bytes, renvoyez-les directement sans les sérialiser en JSON
        response = Response(response_data, status=status_code, headers=dict(headers))
    else:
        # Sinon, sérialisez les données en JSON et renvoyez-les
        response = jsonify(response_data)
        response.status_code = status_code
        for key, value in headers:
            response.headers[key] = value

    return response
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
