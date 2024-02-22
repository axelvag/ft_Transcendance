# from django.shortcuts import render
# from .models import Profile
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_http_methods
# from django.http import JsonResponse
# import json
# from django.core.exceptions import ObjectDoesNotExist

# from django.shortcuts import render, redirect
# from django.middleware.csrf import get_token
# from django.http import HttpResponse
# from django.http import JsonResponse
# from django.template import loader
# from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
# from django.contrib.auth import authenticate, login, logout
# from django.contrib import messages
# # from .forms import UserCreationFormWithEmail
# # from .forms import UsernameOrEmailAuthenticationForm
# from django.contrib.auth import get_user_model
# from django.template.loader import render_to_string
# from django.contrib.sites.shortcuts import get_current_site
# from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# from django.utils.encoding import force_bytes, force_str
# from django.core.mail import EmailMessage
# # from .tokens import account_activation_token
# from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseServerError
# from django.views.decorators.http import require_POST
# import json
# from django.contrib.auth.decorators import login_required
# from django.views.decorators.csrf import csrf_exempt

# User = get_user_model()

# # Create your views here.
# @csrf_exempt
# @require_http_methods(["POST"])  # Accepte uniquement les requêtes POST
# def update_user(request):

#     print("salut")

#     try:
#         # Assurez-vous que le corps de la requête est au format JSON
#         data = json.loads(request.body)

#         username = data.get('username')
#         email = data.get('email')
#         user_id = data.get('id')  # Identifiant de l'utilisateur à mettre à jour
        
#         first_name = data.get('firstName')
#         last_name = data.get('lastName')

#         # Recherche de l'utilisateur par son ID
#         user = User.objects.get(pk=user_id)

#         profile = Profile.objects.get(pk=user_id)
#         if profile is None:
#           profile = Profile.objects.create(firstName=first_name, lastName=last_name, user_id_tableUser=user_id)
#           # return JsonResponse({'error': 'User not found'}, status=404)
        
#         # Mise à jour de l'utilisateur
#         if username:
#             user.username = username
#         if email:
#             user.email = email
#         if first_name:
#             profile.first_name = first_name
#         if last_name:
#             profile.last_name = last_name
#         if user_id:
#             profile.user_id_tableUser = user_id

#         user.save()
#         profile.save()

#         return JsonResponse({"success": True, "message": "Utilisateur mis à jour avec succès."})
#     except ObjectDoesNotExist:
#         return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=444)
#     except Exception as e:
#         return JsonResponse({"success": False, "message": str(e)}, status=500)

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Profile
from django.contrib.auth import get_user_model
import logging

# username, email fonctionne --> a corriger user_id first_name, last_name
# logger = logging.getLogger(__name__)
User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def update_user(request):

    # logger.debug('Message de débogage')
    print("Hellllllllloooooooooooooooooooooooooo")
    logging.critical("111111111111")

    try:
        data = json.loads(request.body)
        user_id = data.get('id')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        username = data.get('username')
        email = data.get('email')

        # Assurez-vous que vous récupérez l'objet User et Profile correctement
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logging.critical("2222222222222222")
            return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=404)

        # Si le profil existe, nous le mettons à jour, sinon nous en créons un nouveau
        # profile, created = Profile.objects.get_or_create(user=user)
        # profile = Profile.objects.get(pk=user_id)
        # if profile is None:
        #   profile = Profile.objects.create(firstName=first_name, lastName=last_name, user_id_tableUser=user_id)
        # logging.critical("yooo")
        # try:
        #     logging.critical("33333333333333")
        #     profile = Profile.objects.get(user=user)  # Assumant que 'user' est la clé étrangère dans Profile pointant vers User
        # except Profile.DoesNotExist:
        #     logging.critical("4444444444444444444")
        #     profile = Profile.objects.create(user=user, first_name=first_name, last_name=last_name)

        try:
            logging.critical("33333333333333")
            profile, created = Profile.objects.get_or_create(user=user, defaults={'first_name': first_name, 'last_name': last_name})
            if created:
                logging.critical("Nouveau profil créé pour l'utilisateur")
            else:
                logging.critical("Profil existant trouvé pour l'utilisateur")
        except Exception as e:
            logging.critical("Une exception s'est produite lors de la tentative de récupération ou de création du profil: {}".format(str(e)))
        return JsonResponse({"success": False, "message": "Erreur lors de la création ou récupération du profil utilisateur."}, status=500)


        logging.critical("yeppppppe")
        # Mise à jour de l'utilisateur
        if username:
            user.username = username
        if email:
            user.email = email
        user.save()  # Sauvegardez les changements de l'utilisateur

        logging.critical("56565656565656")
        # Mise à jour du profil
        if first_name:
            profile.first_name = first_name
        if last_name:
            profile.last_name = last_name
        profile.save()  # Sauvegardez les changements du profil

        return JsonResponse({"success": True, "message": "Utilisateur mis à jour avec succès."})

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Données JSON invalides."}, status=400)
    except Exception as e:
        logging.critical("55555555555555555555")
        return JsonResponse({"success": False, "message": str(e)}, status=500)