from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Statistic
from django.contrib.auth import get_user_model
import logging
import requests

User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def setter_stat(request):
    logging.critical("ENTRE DANS SETTER_STAT")
    logging.debug("SETTER_STAT")
    # Tentative d'extraction des données JSON
    try:
        data = json.loads(request.body.decode('utf-8'))
        user_id = data.get('id')
        victories = data.get('victories')
        lost = data.get('lost')
        online = data.get('online')
        local = data.get('local')
        timeplay = data.get('timeplay')
        nbtotal = data.get('nbtotal')
        friends = data.get('friends')
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid or missing JSON data."}, status=400)

    # Mettre à jour les statistiques de l'utilisateur
    try:
        stat, created = Statistic.objects.update_or_create(
            user_id=user_id,
            defaults={
                'victories': victories,
                'lost': lost,
                'online': online,
                'local': local,
                'timeplay': timeplay,
                'nbtotal': nbtotal,
                'friends': friends
            }
        )
    except Exception as e:
        logging.error(f"Error updating user statistics: {e}")
        return JsonResponse({"success": False, "message": "Error updating user statistics."})

    # Réponse de succès
    response = JsonResponse({
        "success": True,
        "message": "User statistics updated successfully.",
        "id": user_id,
        "victories": victories,
        "lost": lost,
        "online": online,
        "local": local,
        "timeplay": timeplay,
        "nbtotal": nbtotal,
        "friends": friends
    })

    # Ajouter les en-têtes CORS
    response["Access-Control-Allow-Origin"] = "*"  # Ou vous pouvez spécifier les origines autorisées
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"  # Méthodes HTTP autorisées
    response["Access-Control-Allow-Headers"] = "Content-Type"  # En-têtes autorisés

    return response


@csrf_exempt
@require_http_methods(["GET"])  # Utilisez GET si vous récupérez simplement des informations, ajustez selon besoin
def getter_stat(request, user_id):  # Assurez-vous que user_id est correctement capturé depuis l'URL
    
    logging.critical("ENTRE DANS GETTER_STAT")
    logging.critical(user_id)
    logging.debug("GETTER_STAT")

    try:
        # Recherche du profil par user_id
        profile = Profile.objects.get(user_id=user_id)
    except Profile.DoesNotExist:
        return JsonResponse({"success": False, "message": "Profile not found."}, status=404)

    # # Faites un appel au service d'authentification pour obtenir username et email
    # auth_service_url = "http://authentification:8001/accounts/get_profile/"
    # try:
    #     auth_response = requests.get(f"{auth_service_url}{user_id}")
    #     if auth_response.status_code == 200:
    #         auth_data = auth_response.json()
    #         username = auth_data.get('username', '')
    #         email = auth_data.get('email', '')
    #     else:
    #         return JsonResponse({"success": False, "message": "Failed to retrieve authentication information."})
    # except requests.exceptions.RequestException as e:
    #     logging.error(f"Error calling authentication service: {e}")
    #     return JsonResponse({"success": False, "message": "Error calling authentication service."})

    # Réponse avec les informations récupérées
    return JsonResponse({
        "success": True,
        "id": user_id,
        "victories": 0,
        "lost": 0,
        "online": 0,
        "local": 0,
        "timeplay": 0,
        "nbtotal": 0,
        "friends": 0
    })