from django.shortcuts import render, redirect
from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .forms import UserCreationFormWithEmail
from .forms import UsernameOrEmailAuthenticationForm
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from .tokens import account_activation_token
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseServerError
from django.views.decorators.http import require_POST
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import logging

from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from django.conf import settings
import requests
from django.middleware.csrf import CsrfViewMiddleware
import os
from dotenv import load_dotenv
from django.http import JsonResponse
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User

# Déterminez le chemin absolu vers le fichier .env
# dotenv_path = '../../.env'

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

# Charger les variables d'environnement à partir du fichier .env
load_dotenv(dotenv_path)
# load_dotenv()

# Create your views here.
User = get_user_model()

def activate(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        print("Email Valid")
        return JsonResponse({"success": True, "message": "Thank you for your email confirmation. Now you can login your account."}, status=200)
    else:
        print("Email Invalid")
        return JsonResponse({"success": False, "message": "Activation link is invalid!"}, status=HttpResponseBadRequest.status_code)

def activateEmail(request, user, to_email):
    mail_subject = "Activate your user account"
    print("URL: ", os.getenv('BASE_URL'))
    message = render_to_string("template_activate_account.html", {
        'url': os.getenv('BASE_URL'),
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    if email.send():
        return JsonResponse({"success": True, "message": f'Dear {user}, please go to your email {to_email} inbox and click on the received activation link to confirm and complete the registration. Note: Check your spam folder.'}, status=200)
    else:
        return JsonResponse({"success": False, "message": f'Problem sending email to {to_email}, check if you typed it correctly.'}, status=HttpResponseBadRequest.status_code)

def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf8'))
            print("Received data:", data)
        except json.JSONDecodeError:
            return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
        username_or_email = data["username"]
        password = data["password"]
        user = None

        if len(password) < 8:
            return JsonResponse({"success": False, "message": "Invalid username or password."}, status=HttpResponseBadRequest.status_code)

        if '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
                if not user.check_password(password):  # Vérifie le mot de passe pour l'email
                    user = None
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(username=username_or_email)
                if not user.check_password(password):  # Vérifie le mot de passe pour l'email
                        user = None
            except User.DoesNotExist:
                pass
            # user = authenticate(request, username=username_or_email, password=password)

        if user is not None:
            if user.is_active:  # Assurez-vous que l'utilisateur est actif
                login(request, user)
                print("login success")
                return JsonResponse({"success": True, "message": "Login successful.", "username": user.username, "id": user.id, "email": user.email}, status=200)
            else:
                print("User not active")
                return JsonResponse({"success": False, "message": "User not active."}, status=HttpResponseBadRequest.status_code)
        else:
            print("login failed")
            return JsonResponse({"success": False, "message": "Invalid username or password."}, status=HttpResponseBadRequest.status_code)

    return JsonResponse({"success": False, "message": "Invalid request method."}, status=HttpResponseBadRequest.status_code)

def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"success": True, "message": "Déconnexion réussie."})
    else:
        return JsonResponse({"success": False, "message": "Méthode non autorisée."}, status=405)

def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf8'))
            print("Received data:", data)
        except json.JSONDecodeError:
            return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
        form = UserCreationFormWithEmail(data)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            activateEmail(request, user, form.cleaned_data.get('email'))
            print("yooo")
            return JsonResponse({"success": True, "message": "Registration successful. Please check your email to activate your account."}, status=200)
        else:
            print("yo")
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
    else:
        print("yoo")
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=HttpResponseBadRequest.status_code)

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

def is_user_active(request, uidb64, token):
    print("je passe")
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)
    # Vérifiez si l'utilisateur est connecté et actif
    if user.is_active:
        print("user actif")
        return JsonResponse({"success": True, "message": "user actif."}, status=200)
    else:
        print("user pas actif")
        return JsonResponse({"success": False, "message": "user non actif."}, status=400)

def resend_email_confirmation(request, uidb64):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)
    to_email = user.email
    mail_subject = "Activate your user account"
    message = render_to_string("template_activate_account.html", {
        'url': os.getenv('BASE_URL'),
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    if email.send():
        return JsonResponse({"success": True, "message": f'Dear {user}, please go to your email {to_email} inbox and click on the received activation link to confirm and complete the registration. Note: Check your spam folder.'}, status=200)
    else:
        return JsonResponse({"success": False, "message": f'Problem sending email to {to_email}, check if you typed it correctly.'}, status=HttpResponseServerError.status_code)

def password_reset(request):
    User = get_user_model()
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if not email:
                return JsonResponse({'error': 'Adresse e-mail manquante.'}, status=400)
            try:
                user = User.objects.get(email=email)
                to_email = user.email
                mail_subject = "Réinitialisation de votre mot de passe sur Transcendence"
                message = render_to_string("template_forget_pass.html", {
                    'url': os.getenv('BASE_URL'),
                    'user': user.username,
                    'domain': get_current_site(request).domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': account_activation_token.make_token(user),
                    "protocol": 'https' if request.is_secure() else 'http'
                })
                email = EmailMessage(mail_subject, message, to=[to_email])
                if email.send():
                    return JsonResponse({"success": True, "message": f'Dear {user.username}, please go to your email {to_email} inbox and click on the received activation link to confirm the renitialisation of your password.'}, status=200)
                else:
                    return JsonResponse({"success": False, "message": f'Problem sending email to {to_email}, check if you typed it correctly.'}, status=500)  # Utilisez status=500 pour les erreurs serveur
            except User.DoesNotExist:
                return JsonResponse({'error': 'Aucun utilisateur trouvé avec cette adresse e-mail.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Données invalides.'}, status=400)
    else:
        return JsonResponse({'error': 'Méthode de requête non autorisée.'}, status=405)


def activate_mail_pass(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)

    if user is not None and account_activation_token.check_token(user, token):
        # user.is_active = True
        # user.save()
        print("Email Valid")
        return JsonResponse({"success": True, "message": "Thank you for your email confirmation. Now you can login your account."}, status=200)
    else:
        print("Email Invalid")
        return JsonResponse({"success": False, "message": "Activation link is invalid!"}, status=HttpResponseBadRequest.status_code)


def password_change(request, uidb64):
    if request.method == 'POST':
        User = get_user_model()
        try:
            data = json.loads(request.body)
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                # password_reset = PasswordReset.objects.get(user=user)  # Assurez-vous que cette ligne est correcte
            except Exception as e:
                return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)

            if not new_password or not confirm_password:
                print("error2")
                return JsonResponse({'error': 'Le mot de passe est requis.'}, status=400)

            if new_password != confirm_password:
                print("error3")
                return JsonResponse({'error': 'Les mots de passe ne correspondent pas.'}, status=400)

            # user = password_reset.user
            user.set_password(new_password)
            user.save()
            return JsonResponse({'success': 'Le mot de passe a été réinitialisé avec succès.'}, status=200)

        except json.JSONDecodeError:
            print("error4")
            return JsonResponse({'error': 'Données invalides.'}, status=400)

    else:
        print("error5")
        return JsonResponse({'error': 'Méthode de requête non autorisée.'}, status=405)

def resend_email_rest(request, uidb64):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)
    to_email = user.email
    mail_subject = "Réinitialisation de votre mot de passe sur Transcendence"
    message = render_to_string("template_forget_pass.html", {
        'url': os.getenv('BASE_URL'),
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    if email.send():
        return JsonResponse({"success": True, "message": f'Dear {user}, please go to your email {to_email} inbox and click on the received activation link to confirm the renitialisation of your password. Note: Check your spam folder.'}, status=200)
    else:
        return JsonResponse({"success": False, "message": f'Problem sending email to {to_email}, check if you typed it correctly.'}, status=HttpResponseServerError.status_code)

@login_required
@require_http_methods(["DELETE"])
def delete_user(request, username):
    print("delete userrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
    try:
        user = User.objects.get(username=username)
        user.delete()
        return JsonResponse({"success": True, "message": "User deleted successfully."}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

def is_user_logged_in(request):
    if request.user.is_authenticated:
        return JsonResponse({"success": True, "message": "User is login.", "username": request.user.username, "email": request.user.email, "id": request.user.id}, status=200)
    else:
        return JsonResponse({"success": False, "message": "User is not login."}, status=400)

# Dans le service d'authentification
@csrf_exempt
# @require_http_methods(["POST"])
def update_profile(request):
    logging.critical("Enter1")
    data = json.loads(request.body)
    user_id = data.get('id')
    username = data.get('username')
    email = data.get('email')

    logging.critical(data)
    logging.critical(request)
    print(user_id)
    logging.critical(user_id)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logging.critical("closeBackAuth")
        return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=404)

    # if username:
    #     user.username = username
    if username:
        # Vérifie si un autre utilisateur utilise déjà ce username
        if User.objects.exclude(pk=user_id).filter(username=username).exists():
            # Si oui, renvoyez une erreur sans mettre à jour les informations de l'utilisateur
            return JsonResponse({"success": False, "message": "Ce nom d'utilisateur est déjà pris."}, status=400)

        user.username = username

    if email:
        user.email = email
    user.save()
    
    logging.critical("blablabla")
    return JsonResponse({"success": True, "message": "Informations utilisateur mises à jour avec succès.", "username": user.username, "email": user.email})

@csrf_exempt
@require_http_methods(["GET"])
def get_profile(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logging.critical("Utilisateur non trouvé.")
        return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=404)

    # Renvoi des informations de l'utilisateur
    return JsonResponse({
        "success": True,
        "message": "Informations utilisateur récupérées avec succès.",
        "username": user.username,
        "email": user.email
    })

def oauth_callback(request):
    try:
        data = json.loads(request.body.decode('utf8'))
        print("Received data:", data)
    except json.JSONDecodeError:
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
    code = data.get('code')
    print(code)
    print(settings.OAUTH_CLIENT_ID)
    if code:
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH_CLIENT_ID,
            'client_secret': settings.OAUTH_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH_REDIRECT_URI,
        }
        response = requests.post("https://api.intra.42.fr/oauth/token", data=token_data)
        print(response.status_code)
        if response.status_code == 200:
            access_token = response.json().get('access_token')
            print(access_token)
            profile_data = requests.get(
                "https://api.intra.42.fr/v2/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            print(profile_data)
            if profile_data.status_code == 200:
                profile_data_json = profile_data.json()
                print(profile_data_json)
                if not User.objects.filter(email=profile_data_json['email']).exists():
                    # Créez l'utilisateur s'il n'existe pas
                    user = User.objects.create_user(
                        username=profile_data_json['login'],
                        email=profile_data_json['email'],
                        # first_name=profile_data_json.get('first_name', ''),  # Utilisez `.get` pour éviter KeyError si la clé n'existe pas
                        # last_name=profile_data_json.get('last_name', '')
                    )
                    user.set_password('Api42')
                    user.is_active = True
                    user.save()
                    register = True
                    print(f"L'utilisateur {user.username} a été créé avec succès.")
                    user = authenticate(username=user.username, password='Api42')
                    if user is not None:
                        login(request, user)
                    else:
                        return JsonResponse({'error': 'Authentification fail'}, status=400)
                else:
                    register = False
                    user = User.objects.get(email=profile_data_json.get('email'))
                    if not user.check_password('Api42'):  # Vérifie le mot de passe pour l'email
                        user = None
                    # user = authenticate(username=profile_data_json.get('login'), password='un_mot_de_passe_temporaire_ou_sécurisé')
                    if user is not None:
                        login(request, user)
                    else:
                        return JsonResponse({'error': 'Authentification fail user exist'}, status=400)
            else:
                return JsonResponse({'error': f"Erreur lors de la récupération des données de profil: {profile_data.status_code}"}, status=400)
            return JsonResponse({'message': 'Authentification réussie', 'access_token': access_token, "username": user.username, "id": user.id, "email": user.email, "avatar": profile_data_json.get('image'), "firstname": profile_data_json.get('first_name'), "lastname": profile_data_json.get('last_name'), "register": register})
        else:
            return JsonResponse({'error': 'Erreur lors de l\'obtention du token d\'accès'}, status=400)
    else:
        return JsonResponse({'error': 'Code d\'autorisation manquant'}, status=400)

@csrf_exempt
def verif_sessionID(request, session_id):

    if not session_id:
        return JsonResponse({'error': 'SessionID manquant'}, status=400)

    try:
        # Vérifier si le sessionID existe
        session = Session.objects.get(session_key=session_id)
    except Session.DoesNotExist:
        return JsonResponse({'error': 'SessionID invalide'}, status=404)

    # Récupérer les données de session
    session_data = session.get_decoded()
    user_id = session_data.get('_auth_user_id')

    if not user_id:
        return JsonResponse({'error': 'Utilisateur non trouvé pour cette session'}, status=404)

    # Récupérer l'utilisateur associé à cette session
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)

    # Réponse de succès avec le nom d'utilisateur
    logging.critical(user.username)
    return JsonResponse({'success': 'Session valide', 'username': user.username, 'user_id': user.id}, status=200)
