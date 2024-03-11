# from django.core.exceptions import ObjectDoesNotExist
# from django.http import JsonResponse
# from django.views.decorators.http import require_http_methods
# from django.views.decorators.csrf import csrf_exempt
# import json
# from .models import Profile
# from django.contrib.auth import get_user_model
# import logging
# import requests
# from django.http import JsonResponse

# User = get_user_model()

# @csrf_exempt
# @require_http_methods(["POST"])
# def update_user(request):
#     if request.method == "POST":
#         logging.critical("Enter")
#         data = json.loads(request.body)
#         user_id = data.get('id')
#         first_name = data.get('firstname')
#         last_name = data.get('lastname')
#         username = data.get('username')
#         email = data.get('email')

#         # Appel au service d'authentification pour mettre à jour le username et l'email
#         # auth_service_url = 'http://127.0.0.1:8001/accounts/update_profile/'  # URL de l'API du service d'authentification
#         auth_service_url = "http://authentification:8001/accounts/update_profile/"
#         # response = requests.post(auth_service_url, json={"key": "value"})  # Assurez-vous que la clé et la valeur sont correctes
#         # print(response.status_code, response.text)
#         auth_data = {
#             'id': user_id,
#             'username': data.get('username'),
#             'email': data.get('email'),
#         }
#         logging.critical("11111111")
#         auth_response = requests.post(auth_service_url, json=auth_data)
#         logging.critical("222222222")
#         if auth_response.status_code != 200:
#             # Gérer l'erreur si l'appel au service d'authentification échoue
#             logging.critical("close1")
#             return JsonResponse({"success": False, "message": "Échec de la mise à jour des informations d'authentification."})

#         profile, created = Profile.objects.get_or_create(
#             user_id=user_id,  # Supposons que vous avez un champ user_id dans votre modèle Profile
#             defaults={
#                 'firstName': first_name,
#                 'lastName': last_name,
#             }
#         )

#         # Si le profil existait déjà et que nous voulons le mettre à jour avec de nouvelles valeurs
#         if not created:
#             profile.firstName = first_name
#             profile.lastName = last_name
#             profile.save()
            
#         logging.critical("close2")
#         # return JsonResponse({"success": True, "message": "Profil mis à jour ou créé avec succès.", "firstname": profile.firstName, "lastname": profile.lastName}, status=200)
        
#         # Construction de l'URL absolue de l'avatar
#         avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
        
#         print(avatar_url)
#         logging.critical(avatar_url)

#         return JsonResponse({
#             "success": True,
#             "message": "Profil mis à jour ou créé avec succès.",
#             "firstname": profile.firstName,
#             "lastname": profile.lastName,
#             "username": username,  # Ajout du username à la réponsemake 
#             "email": email,  # Ajout de l'email à la réponse
#             "avatar": avatar_url,
#         }, status=200)

#     else:
#         logging.critical("close3")
#         return JsonResponse({"success": False, "message": "Méthode HTTP non autorisée."}, status=405)

# @csrf_exempt
# @require_http_methods(["POST"])
# def save_avatar(request):
#     logging.critical("Received avatar upload request")
#     user_id = request.POST.get('id')
#     avatar = request.FILES.get('avatar')
#     logging.critical(f"User ID: {user_id}, Avatar: {avatar}")

#     try:
#         # Assurez-vous que le 'user_id' est un entier
#         # user_id = int(user_id)

#         # Tentez de récupérer ou de créer le profil
#         profile, created = Profile.objects.get_or_create(
#             user_id=user_id,
#             defaults={'avatar': avatar},
#         )

#         # Si le profil existait déjà et que nous voulons le mettre à jour avec de nouvelles valeurs
#         if not created:
#             profile.avatar = avatar
#             profile.save()

#         # Construction de l'URL absolue de l'avatar
#         avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None

#         logging.critical("Avatar updated successfully")
#         return JsonResponse({"success": True, "avatar": avatar_url})

#     except ValueError:
#         return JsonResponse({"success": False, "message": "L'ID utilisateur doit être un entier."}, status=400)
#     except Profile.DoesNotExist:
#         logging.critical("Profile not found")
#         return JsonResponse({"success": False, "message": "Profil non trouvé."}, status=404)
#     except Exception as e:
#         logging.error(f"Unexpected error: {e}")
#         return JsonResponse({"success": False, "message": "Une erreur inattendue est survenue."}, status=500)


#####################################################################################

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Profile
from django.contrib.auth import get_user_model
import logging
import requests

User = get_user_model()

# @csrf_exempt
# @require_http_methods(["POST"])
# def update_user(request):
#     logging.critical("Received request")
    
#     if request.content_type == 'application/json':
#         # Traitement de la mise à jour des informations de l'utilisateur
#         data = json.loads(request.body)
#         user_id = data.get('id')
#         first_name = data.get('firstname')
#         last_name = data.get('lastname')
#         username = data.get('username')
#         email = data.get('email')

#         auth_service_url = "http://authentification:8001/accounts/update_profile/"
#         auth_data = {
#             'id': user_id,
#             'username': username,
#             'email': email,
#         }
#         logging.critical("Calling auth service")
#         auth_response = requests.post(auth_service_url, json=auth_data)
        
#         if auth_response.status_code != 200:
#             logging.critical("Auth service failed")
#             return JsonResponse({"success": False, "message": "Échec de la mise à jour des informations d'authentification."})

#         profile, created = Profile.objects.get_or_create(
#             user_id=user_id,
#             defaults={
#                 'firstName': first_name,
#                 'lastName': last_name,
#             }
#         )

#         if not created:
#             profile.firstName = first_name
#             profile.lastName = last_name
#             profile.save()
        
#         avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
        
#         logging.critical("User updated successfully")
#         return JsonResponse({
#             "success": True,
#             "message": "Profil mis à jour ou créé avec succès.",
#             "firstname": first_name,
#             "lastname": last_name,
#             "username": username,
#             "email": email,
#             "avatar": avatar_url,
#         })

#     elif 'avatar' in request.FILES:
#         # Traitement de l'upload d'avatar
#         user_id = request.POST.get('id')
#         avatar = request.FILES.get('avatar')
#         logging.critical(f"Processing avatar for User ID: {user_id}")

#         try:
#             profile, created = Profile.objects.get_or_create(
#                 user_id=user_id,
#                 defaults={'avatar': avatar},
#             )

#             if not created:
#                 profile.avatar = avatar
#                 profile.save()

#             avatar_url = request.build_absolute_uri(profile.avatar.url)

#             logging.critical("Avatar updated successfully")
#             return JsonResponse({"success": True, "avatar": avatar_url})

#         except ValueError:
#             return JsonResponse({"success": False, "message": "L'ID utilisateur doit être un entier."}, status=400)
#         except Profile.DoesNotExist:
#             logging.critical("Profile not found")
#             return JsonResponse({"success": False, "message": "Profil non trouvé."}, status=404)
#         except Exception as e:
#             logging.error(f"Unexpected error: {e}")
#             return JsonResponse({"success": False, "message": "Une erreur inattendue est survenue."}, status=500)

#     else:
#         logging.critical("Invalid request")
#         return JsonResponse({"success": False, "message": "Requête invalide."}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def update_user(request):
    logging.critical("Received request")
    
    if request.content_type.startswith('multipart/form-data'): # grace au formData envoyer
        # Extraction des données depuis une requête multipart/form-data
        user_id = request.POST.get('id')
        first_name = request.POST.get('firstname', '')
        last_name = request.POST.get('lastname', '')
        username = request.POST.get('username', '')
        email = request.POST.get('email', '')
        avatar = request.FILES.get('avatar', None)
    else:
        # Tentative d'extraction des données JSON
        try:
            logging.critical("yooo")
            data = json.loads(request.body.decode('utf-8'))
            user_id = data.get('id')
            first_name = data.get('firstname', '')
            last_name = data.get('lastname', '')
            username = data.get('username', '')
            email = data.get('email', '')
            avatar = request.FILES.get('avatar', None)  # Pas d'avatar dans les données JSON
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid or missing JSON data."}, status=400)

    logging.critical(avatar)
    # Mise à jour des informations d'authentification via un service externe (exemple hypothétique)
    auth_service_url = "http://authentification:8001/accounts/update_profile/"
    auth_data = {'id': user_id, 'username': username, 'email': email}
    try:
        auth_response = requests.post(auth_service_url, json=auth_data)
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
    except Profile.DoesNotExist:
        # Si aucun profil n'existe pour cet utilisateur et qu'aucun avatar n'est fourni
        profile = Profile.objects.create(
            user_id=user_id,
            firstName=first_name,
            lastName=last_name,
            # Initialisez d'autres champs si nécessaire
        )
    except Exception as e:
        logging.error(f"Error updating or creating profile: {e}")
        return JsonResponse({"success": False, "message": "Error updating or creating profile."})

    # Construction de l'URL de l'avatar
    avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None

    # Réponse de succès avec les informations mises à jour
    return JsonResponse({
        "success": True,
        "message": "Profile updated successfully.",
        "id": user_id,
        "firstname": profile.firstName,
        "lastname": profile.lastName,
        "username": username,
        "email": email,
        "avatar": avatar_url,
    })