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

# @csrf_exempt
# @require_http_methods(["POST"])
# def update_stat(request):
#     logging.critical("Received request")
    
#     if request.content_type.startswith('multipart/form-data'): # grace au formData envoyer
#         # Extraction des données depuis une requête multipart/form-data
#         user_id = request.POST.get('id')
#         first_name = request.POST.get('firstname', '')
#         last_name = request.POST.get('lastname', '')
#         username = request.POST.get('username', '')
#         email = request.POST.get('email', '')
#         avatar = request.FILES.get('avatar', None)
#     else:
#         # Tentative d'extraction des données JSON
#         try:
#             logging.critical("yooo")
#             data = json.loads(request.body.decode('utf-8'))
#             user_id = data.get('id')
#             first_name = data.get('firstname', '')
#             last_name = data.get('lastname', '')
#             username = data.get('username', '')
#             email = data.get('email', '')
#             avatar = request.FILES.get('avatar', None)  # Pas d'avatar dans les données JSON
#         except json.JSONDecodeError:
#             return JsonResponse({"success": False, "message": "Invalid or missing JSON data."}, status=400)

#     logging.critical(avatar)
#     # Mise à jour des informations d'authentification via un service externe (exemple hypothétique)
#     auth_service_url = "http://authentification:8001/accounts/update_profile/"
#     auth_data = {'id': user_id, 'username': username, 'email': email}
#     try:
#         auth_response = requests.post(auth_service_url, json=auth_data)
#         if auth_response.status_code != 200:
#             return JsonResponse({"success": False, "message": "Failed to update authentication information."})
#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error calling authentication service: {e}")
#         return JsonResponse({"success": False, "message": "Error calling authentication service."})

#     # Mise à jour ou création du profil utilisateur dans la base de données locale
#     try:
#         defaults = {
#         'firstName': first_name,
#         'lastName': last_name,
#         }
    
#         # Si un avatar est fourni, ajoutez-le aux valeurs par défaut pour la mise à jour/création
#         if avatar is not None:
#             defaults['avatar'] = avatar

#         profile, created = Profile.objects.update_or_create(
#             user_id=user_id,
#             defaults=defaults
#         )
#     except Profile.DoesNotExist:
#         # Si aucun profil n'existe pour cet utilisateur et qu'aucun avatar n'est fourni
#         profile = Profile.objects.create(
#             user_id=user_id,
#             firstName=first_name,
#             lastName=last_name,
#             # Initialisez d'autres champs si nécessaire
#         )
#     except Exception as e:
#         logging.error(f"Error updating or creating profile: {e}")
#         return JsonResponse({"success": False, "message": "Error updating or creating profile."})

#     # Construction de l'URL de l'avatar
#     avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None

#     # Réponse de succès avec les informations mises à jour
#     return JsonResponse({
#         "success": True,
#         "message": "Profile updated successfully.",
#         "id": user_id,
#         "firstname": profile.firstName,
#         "lastname": profile.lastName,
#         "username": username,
#         "email": email,
#         "avatar": avatar_url,
#     })