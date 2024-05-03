from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Profile
from django.contrib.auth import get_user_model
import logging
import requests
from django.contrib.auth.decorators import login_required
from dotenv import load_dotenv
import os
from django.core.files.images import get_image_dimensions

load_dotenv()
BASE_URL = os.getenv('BASE_URL')

User = get_user_model()

@csrf_exempt
def verif_sessionID(view_func):
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('sessionid', None)
        update_url = f"https://authentification:8001/accounts/verif_sessionid/{session_id}"
        response = requests.get(update_url, verify=False)

        if response.status_code != 200:
            return JsonResponse({"success": False, "message": "SessionID Invalid"}, status=400)

        # Si la vérification est réussie, exécuter la vue originale
        return view_func(request, *args, **kwargs)

    return wrapper

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def update_user(request):
    if request.content_type.startswith('multipart/form-data'): # grace au formData envoyer
        # Extraction des données depuis une requête multipart/form-data
        user_id = request.POST.get('id')
        first_name = request.POST.get('firstname', '')
        last_name = request.POST.get('lastname', '')
        username = request.POST.get('username', '')
        # email = request.POST.get('email', '')
        avatar = request.FILES.get('avatar', None)
        if avatar is None:
            avatar42 = request.POST.get('avatar', None)
        else:
            avatar42 = None
    else:
        # Tentative d'extraction des données JSON
        try:
            data = json.loads(request.body.decode('utf-8'))
            user_id = data.get('id')
            first_name = data.get('firstname', '')
            last_name = data.get('lastname', '')
            username = data.get('username', '')
            # email = data.get('email', '')
            avatar = request.FILES.get('avatar', None)  # Pas d'avatar dans les données JSON
            if avatar is None:
                avatar42 = data.get('avatar', None)
            else:
                avatar42 = None
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid or missing JSON data."}, status=400)

    # Validation for length
    if len(username) > 100 or len(first_name) > 100 or len(last_name) > 100:
        return JsonResponse({"success": False, "message": "Username, first name, or last name exceed 100 characters."}, status=400)

    # Avatar checks
    if avatar:
        if avatar.size > 1024 * 1024 * 5:  # 5 MB limit
            return JsonResponse({"success": False, "message": "Avatar file size must be under 5MB."}, status=400)

        if not avatar.content_type in ['image/jpeg', 'image/png']:
            return JsonResponse({"success": False, "message": "Avatar must be a JPEG or PNG file."}, status=400)

        # Optional: Check image dimensions
        width, height = get_image_dimensions(avatar)
        if width > 3000 or height > 3000:
            return JsonResponse({"success": False, "message": "Avatar dimensions should be less than 3000x3000px."}, status=400)

    # Mise à jour des informations d'authentification via un service externe
    auth_service_url = "https://authentification:8001/accounts/update_profile/"
    auth_data = {'id': user_id, 'username': username}#, 'email': email}

    try:
        auth_response = requests.post(auth_service_url, json=auth_data, verify=False)
        if auth_response.status_code == 400:
            return JsonResponse({"success": False, "message": "This user name is already taken."})
        if auth_response.status_code != 200:
            return JsonResponse({"success": False, "message": "Failed to update authentication information."})
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling authentication service: {e}")
        return JsonResponse({"success": False, "message": "Error calling authentication service."})

    # Mise à jour ou création du profil utilisateur dans la base de données locale
    try:
        defaults = {
        'firstName': first_name,
        'lastName': last_name,
        }

    
        # Si un avatar est fourni, ajoutez-le aux valeurs par défaut pour la mise à jour/création
        if avatar is not None:
            defaults['avatar'] = avatar

        profile, created = Profile.objects.update_or_create(
            user_id=user_id,
            defaults=defaults
        )

        if profile.avatar42 is None:
            profile.avatar42 = avatar42
            profile.save()  # Sauvegarder les modifications sur le profil
    except Profile.DoesNotExist:
        # Si aucun profil n'existe pour cet utilisateur et qu'aucun avatar n'est fourni
        profile = Profile.objects.create(
            user_id=user_id,
            firstName=first_name,
            lastName=last_name,
            avatar42=avatar42,
            # Initialisez d'autres champs si nécessaire
        )
    except Exception as e:
        logging.error(f"Error updating or creating profile: {e}")
        return JsonResponse({"success": False, "message": "Error updating or creating profile."})

    # Construction de l'URL de l'avatar
    base_url = BASE_URL + ':8001'

    avatar_url = base_url + profile.avatar.url if profile and profile.avatar else None
    if avatar is None:
        if avatar42 is not None:
            avatar_url = avatar42
            profile.avatar = None
            profile.save()
            
    # Réponse de succès avec les informations mises à jour
    return JsonResponse({
        "success": True,
        "message": "Profile updated successfully.",
        "id": user_id,
        "firstname": profile.firstName,
        "lastname": profile.lastName,
        "username": username,
        # "email": email,
        "avatar": avatar_url,
    })


# @login_required
@csrf_exempt
@verif_sessionID
@require_http_methods(["GET"])  # Utilisez GET si vous récupérez simplement des informations, ajustez selon besoin
def get_user_profile(request, user_id):  # Assurez-vous que user_id est correctement capturé depuis l'URL
    
    logging.critical("YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
    logging.critical(user_id)

    try:
        # Recherche du profil par user_id
        profile = Profile.objects.get(user_id=user_id)
    except Profile.DoesNotExist:
        profile = None

    # Faites un appel au service d'authentification pour obtenir username et email
    auth_service_url = "https://authentification:8001/accounts/get_profile/"
    try:
        auth_response = requests.get(f"{auth_service_url}{user_id}", verify=False)
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            username = auth_data.get('username', '')
            email = auth_data.get('email', '')
        else:
            return JsonResponse({"success": False, "message": "Failed to retrieve authentication information."})
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling authentication service: {e}")
        return JsonResponse({"success": False, "message": "Error calling authentication service."})

    # Construction de l'URL de l'avatar si disponible
    base_url = BASE_URL + ':8001'

    avatar_url = base_url + profile.avatar.url if profile and profile.avatar else None
    if profile is not None and avatar_url is None:
        logging.critical("avatar null")
        avatar_url = profile.avatar42
    # Réponse avec les informations récupérées
    return JsonResponse({
        "success": True,
        "firstname": profile.firstName if profile else '',
        "lastname": profile.lastName if profile else '',
        "username": username,  # Ces informations proviennent du service d'authentification
        "email": email,  # Ces informations proviennent du service d'authentification
        "avatar": avatar_url,
        "id": user_id,
        "avatar42": profile.avatar42 if profile else None,
    })

@csrf_exempt
# @verif_sessionID
@require_http_methods(["DELETE"])
def delete_user_profile(request, user_id):
    logging.info(f"Attempting to delete profile for user_id: {user_id}")

    try:
        profile = Profile.objects.get(user_id=user_id)
        logging.info(f"Profile found: {profile}")
        profile.delete()
        return JsonResponse({"success": True, "message": "Profile deleted successfully."})
    except Profile.DoesNotExist:
        logging.info(f"No profile found for user_id: {user_id}, but that's okay.")
        return JsonResponse({"success": True, "message": "No profile found, but operation considered successful."})
    except Exception as e:
        logging.error(f"Error deleting profile: {e}")
        return JsonResponse({"success": False, "message": "Error deleting profile."}, status=500)