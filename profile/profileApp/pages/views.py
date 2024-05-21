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

load_dotenv()
BASE_URL = os.getenv('BASE_URL')

User = get_user_model()

def is_valid_image(file):
    valid_image_mimetypes = ['image/jpeg', 'image/png', 'image/gif']
    return file.content_type in valid_image_mimetypes

@csrf_exempt
def verif_sessionID(view_func):
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('sessionid', None)
        update_url = f"https://authentification:8001/accounts/verif_sessionid/{session_id}"
        try:
            response = requests.get(update_url, verify=False)
        except requests.RequestException as e:
                print(f"HTTP request error: {e}")
                return JsonResponse({'error': 'Communication error with external service'}, status=503)
        if response.status_code != 200:
            return JsonResponse({"success": False, "message": "SessionID Invalid"}, status=400)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def update_user(request):
    if request.content_type.startswith('multipart/form-data'):
        user_id = request.POST.get('id')
        first_name = request.POST.get('firstname', '')
        last_name = request.POST.get('lastname', '')
        username = request.POST.get('username', '')
        avatar = request.FILES.get('avatar', None)
        if avatar is None:
            avatar42 = request.POST.get('avatar', None)
        else:
            avatar42 = None
    else:
        try:
            data = json.loads(request.body.decode('utf-8'))
            user_id = data.get('id')
            first_name = data.get('firstname', '')
            last_name = data.get('lastname', '')
            username = data.get('username', '')
            avatar = request.FILES.get('avatar', None)
            if avatar is None:
                avatar42 = data.get('avatar', None)
            else:
                avatar42 = None
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid or missing JSON data."}, status=400)

    if avatar and not is_valid_image(avatar):
            return JsonResponse({"success": False, "message": "Invalid image file type."}, status=400)

    auth_service_url = "https://authentification:8001/accounts/update_profile/"
    auth_data = {'id': user_id, 'username': username}

    try:
        auth_response = requests.post(auth_service_url, json=auth_data, cookies={'sessionid': request.COOKIES.get('sessionid')}, verify=False)
        if auth_response.status_code == 400:
            return JsonResponse({"success": False, "message": "This user name is already taken."})
        if auth_response.status_code != 200:
            return JsonResponse({"success": False, "message": "Failed to update authentication information."})
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling authentication service: {e}")
        return JsonResponse({"success": False, "message": "Error calling authentication service."})

    # maj or creation user profil in bdd
    try:
        defaults = {
        'firstName': first_name,
        'lastName': last_name,
        }

    
        # if avatar existing, add values by default for maj or creation 
        if avatar is not None:
            defaults['avatar'] = avatar

        profile, created = Profile.objects.update_or_create(
            user_id=user_id,
            defaults=defaults
        )

        if profile.avatar42 is None:
            profile.avatar42 = avatar42
            profile.save()
    except Profile.DoesNotExist:
        # if nothing profil and avatar 
        profile = Profile.objects.create(
            user_id=user_id,
            firstName=first_name,
            lastName=last_name,
            avatar42=avatar42,
        )
    except Exception as e:
        logging.error(f"Error updating or creating profile: {e}")
        return JsonResponse({"success": False, "message": "Error updating or creating profile."})

    base_url = BASE_URL + ':8001'

    avatar_url = base_url + profile.avatar.url if profile and profile.avatar else None
    if avatar is None:
        if avatar42 is not None:
            avatar_url = avatar42
            profile.avatar = None
            profile.save()
            
    return JsonResponse({
        "success": True,
        "message": "Profile updated successfully.",
        "id": user_id,
        "firstname": profile.firstName,
        "lastname": profile.lastName,
        "username": username,
        "avatar": avatar_url,
    })


@csrf_exempt
@verif_sessionID
@require_http_methods(["GET"])
def get_user_profile(request, user_id):

    try:
        profile = Profile.objects.get(user_id=user_id)
    except Profile.DoesNotExist:
        profile = None

    # call service authentification to get username and email
    auth_service_url = "https://authentification:8001/accounts/get_profile/"
    try:
        auth_response = requests.get(f"{auth_service_url}{user_id}", cookies={'sessionid': request.COOKIES.get('sessionid')}, verify=False)
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            username = auth_data.get('username', '')
            email = auth_data.get('email', '')
        else:
            return JsonResponse({"success": False, "message": "Failed to retrieve authentication information."})
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling authentication service: {e}")
        return JsonResponse({"success": False, "message": "Error calling authentication service."})

    base_url = BASE_URL + ':8001'

    avatar_url = base_url + profile.avatar.url if profile and profile.avatar else None
    if profile is not None and avatar_url is None:
        logging.critical("avatar null")
        avatar_url = profile.avatar42
    return JsonResponse({
        "success": True,
        "firstname": profile.firstName if profile else '',
        "lastname": profile.lastName if profile else '',
        "username": username,
        "email": email,
        "avatar": avatar_url,
        "id": user_id,
        "avatar42": profile.avatar42 if profile else None,
    })

@csrf_exempt
@verif_sessionID
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