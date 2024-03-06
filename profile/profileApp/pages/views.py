from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Profile
from django.contrib.auth import get_user_model
import logging
import requests
from django.http import JsonResponse

User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def update_user(request):
    if request.method == "POST":
        logging.critical("Enter")
        data = json.loads(request.body)
        user_id = data.get('id')
        first_name = data.get('firstname')
        last_name = data.get('lastname')
        username = data.get('username')
        email = data.get('email')

        # Appel au service d'authentification pour mettre à jour le username et l'email
        # auth_service_url = 'http://127.0.0.1:8001/accounts/update_profile/'  # URL de l'API du service d'authentification
        auth_service_url = "http://authentification:8001/accounts/update_profile/"
        # response = requests.post(auth_service_url, json={"key": "value"})  # Assurez-vous que la clé et la valeur sont correctes
        # print(response.status_code, response.text)
        auth_data = {
            'id': user_id,
            'username': data.get('username'),
            'email': data.get('email'),
        }
        logging.critical("11111111")
        auth_response = requests.post(auth_service_url, json=auth_data)
        logging.critical("222222222")
        if auth_response.status_code != 200:
            # Gérer l'erreur si l'appel au service d'authentification échoue
            logging.critical("close1")
            return JsonResponse({"success": False, "message": "Échec de la mise à jour des informations d'authentification."})

        profile, created = Profile.objects.get_or_create(
            user_id=user_id,  # Supposons que vous avez un champ user_id dans votre modèle Profile
            defaults={
                'firstName': first_name,
                'lastName': last_name,
            }
        )

        # Si le profil existait déjà et que nous voulons le mettre à jour avec de nouvelles valeurs
        if not created:
            profile.firstName = first_name
            profile.lastName = last_name
            profile.save()
            
        logging.critical("close2")
        # return JsonResponse({"success": True, "message": "Profil mis à jour ou créé avec succès.", "firstname": profile.firstName, "lastname": profile.lastName}, status=200)
        return JsonResponse({
            "success": True,
            "message": "Profil mis à jour ou créé avec succès.",
            "firstname": profile.firstName,
            "lastname": profile.lastName,
            "username": username,  # Ajout du username à la réponse
            "email": email,  # Ajout de l'email à la réponse
        }, status=200)

    else:
        logging.critical("close3")
        return JsonResponse({"success": False, "message": "Méthode HTTP non autorisée."}, status=405)

@csrf_exempt
@require_http_methods(["POST"])
def save_avatar(request):
    # La fonction devrait être modifiée pour traiter les données multipart/form-data
    logging.critical("Received avatar upload request")
    user_id = request.POST.get('id')
    avatar = request.FILES.get('avatar')
    logging.critical(f"User ID: {user_id}, Avatar: {avatar}")

    if not user_id:
        return JsonResponse({"success": False, "message": "ID utilisateur non fourni."}, status=400)

    if not avatar:
        return JsonResponse({"success": False, "message": "Aucun avatar fourni."}, status=400)

    try:
        # Assurez-vous que le 'user_id' est un entier
        user_id = int(user_id)
        profile = Profile.objects.get(user_id=user_id)

        # Sauvegarde ou mise à jour de l'avatar
        profile.avatar = avatar
        profile.save()

        # Si vous servez les fichiers média via Django en mode DEBUG, vous pouvez utiliser `request.build_absolute_uri(profile.avatar.url)` pour obtenir l'URL complète
        avatar_url = profile.avatar.url if profile.avatar else None

        logging.critical("Avatar updated successfully")
        # return JsonResponse({"success": True, "avatar": profile.avatar})
        return JsonResponse({"success": True, "avatar": request.build_absolute_uri(avatar_url)})

    except ValueError:
        return JsonResponse({"success": False, "message": "L'ID utilisateur doit être un entier."}, status=400)
    except Profile.DoesNotExist:
        logging.critical("Profile not found")
        return JsonResponse({"success": False, "message": "Profil non trouvé."}, status=404)
    except Exception as e:
        logging.error("Unexpected error: %s", e)
        return JsonResponse({"success": False, "message": "Une erreur inattendue est survenue."}, status=500)