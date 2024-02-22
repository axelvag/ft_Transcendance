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

# @csrf_exempt
# @require_http_methods(["POST"])
# def update_user(request):

#     # logger.debug('Message de débogage')
#     print("Hellllllllloooooooooooooooooooooooooo")

#     try:
#         data = json.loads(request.body)
#         user_id = data.get('id')
#         first_name = data.get('firstName')
#         last_name = data.get('lastName')
#         username = data.get('username')
#         email = data.get('email')
#         logging.critical("sssasasaa")

#         # Assurez-vous que vous récupérez l'objet User et Profile correctement
#         try:
#             user = User.objects.get(pk=user_id)
#         except User.DoesNotExist:
#             return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=404)

#         logging.critical("22222222222")
#         if username:
#             user.username = username
#         if email:
#             user.email = email
#         user.save()  # Sauvegardez les changements de l'utilisateur

#         profile, created = Profile.objects.get_or_create(user=user, defaults={
#             'firstName': 'Prénom par défaut',
#             'lastName': 'Nom par défaut',
#             # Vous pouvez définir d'autres valeurs par défaut ici
#         })

#         # Si le profil existe déjà, vous pouvez le mettre à jour comme ceci
#         if not created:
#             profile.firstName = 'Nouveau prénom'
#             profile.lastName = 'Nouveau nom'
#             # Mettre à jour d'autres champs si nécessaire
#             profile.save()

#         return JsonResponse({"success": True, "message": "Utilisateur mis à jour avec succès."})

#     except json.JSONDecodeError:
#         return JsonResponse({"success": False, "message": "Données JSON invalides."}, status=400)
#     except Exception as e:
#         return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_user(request):
    if request.method == "POST":
        # Supposons que les données soient envoyées en JSON
        data = json.loads(request.body)
        user_id = data.get('id')
        first_name = data.get('firstname')
        last_name = data.get('lastname')
        username = data.get('username')
        email = data.get('email')

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=404)
        
        if username:
            user.username = username
        if email:
            user.email = email
        user.save()
        # Utiliser get_or_create pour vérifier si le profil existe déjà, sinon en créer un nouveau
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
            
        return JsonResponse({"success": True, "message": "Profil mis à jour ou créé avec succès."})

    else:
        return JsonResponse({"success": False, "message": "Méthode HTTP non autorisée."}, status=405)