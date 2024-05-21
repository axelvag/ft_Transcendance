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

@csrf_exempt
def verif_sessionID_extension(view_func):
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

@require_http_methods(["POST"])
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
        return JsonResponse({"success": True, "message": "Thank you for your email confirmation. Now you can login your account."}, status=200)
    else:
        return JsonResponse({"success": False, "message": "Activation link is invalid!"}, status=HttpResponseBadRequest.status_code)

def activateEmail(request, user, to_email):
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
        return JsonResponse({"success": False, "message": f'Problem sending email to {to_email}, check if you typed it correctly.'}, status=HttpResponseBadRequest.status_code)

@require_http_methods(["POST"])
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf8'))
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
                return JsonResponse({"success": True, "message": "Login successful.", "username": user.username, "id": user.id, "email": user.email}, status=200)
            else:
                return JsonResponse({"success": False, "message": "User not active."}, status=HttpResponseBadRequest.status_code)
        else:
            return JsonResponse({"success": False, "message": "Invalid username or password."}, status=HttpResponseBadRequest.status_code)

    return JsonResponse({"success": False, "message": "Invalid request method."}, status=HttpResponseBadRequest.status_code)

@require_http_methods(["POST"])
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"success": True, "message": "Logout successful."})
    else:
        return JsonResponse({"success": False, "message": "Method not permitted."}, status=405)

def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf8'))
        except json.JSONDecodeError:
            return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
        form = UserCreationFormWithEmail(data)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            activateEmail(request, user, form.cleaned_data.get('email'))
            return JsonResponse({"success": True, "message": "Registration successful. Please check your email to activate your account."}, status=200)
        else:
            return JsonResponse({"success": False, "errors": form.errors}, status=400)
    else:
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=HttpResponseBadRequest.status_code)

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@require_http_methods(["GET"])
def is_user_active(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)
    # Vérifiez si l'utilisateur est connecté et actif
    if user.is_active:
        return JsonResponse({"success": True, "message": "user actif."}, status=200)
    else:
        return JsonResponse({"success": False, "message": "user non actif."}, status=400)

@require_http_methods(["POST"])
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
                return JsonResponse({'error': 'Missing email address.'}, status=400)
            try:
                user = User.objects.get(email=email)
                to_email = user.email
                mail_subject = "Resetting your password on Transcendence"
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
                return JsonResponse({'error': 'No users found with this email address.'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid data.'}, status=400)
    else:
        return JsonResponse({'error': 'Request method not allowed.'}, status=405)

@require_http_methods(["POST"])
def activate_mail_pass(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)

    if user is not None and account_activation_token.check_token(user, token):
        return JsonResponse({"success": True, "message": "Thank you for your email confirmation. Now you can login your account."}, status=200)
    else:
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
            except Exception as e:
                return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)

            if not new_password or not confirm_password:
                return JsonResponse({'error': 'Password is required.'}, status=400)

            if new_password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match.'}, status=400)

            user.set_password(new_password)
            user.save()
            return JsonResponse({'success': 'The password has been successfully reset.'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid data.'}, status=400)

    else:
        return JsonResponse({'error': 'Request method not allowed.'}, status=405)

@require_http_methods(["POST"])
def resend_email_rest(request, uidb64):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        return JsonResponse({"success": False, "message": "Invalid activation link."}, status=HttpResponseBadRequest.status_code)
    to_email = user.email
    mail_subject = "Resetting your password on Transcendence"
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

    try:
        user = User.objects.get(username=username)
        data = json.loads(request.body)
        user_id = data.get('user_id')

        response = requests.post(f"https://friendship:8003/delete_user_data/{user_id}/", cookies={'sessionid': request.COOKIES.get('sessionid')}, verify=False)
        if response.status_code == 200:
            user.delete()
            return JsonResponse({"success": True, "message": "User deleted successfully."}, status=200)
        else:
            return JsonResponse({"success": False, "message": "Failed to delete user data in friendship service."}, status=response.status_code)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)
    except Exception as e:
        logging.critical(f"Error: {str(e)}")
        return JsonResponse({"success": False, "message": str(e)}, status=500)


def is_user_logged_in(request):
    if request.user.is_authenticated:
        return JsonResponse({"success": True, "message": "User is login.", "username": request.user.username, "email": request.user.email, "id": request.user.id}, status=200)
    else:
        return JsonResponse({"success": False, "message": "User is not login."}, status=400)


@csrf_exempt
@verif_sessionID_extension
@require_http_methods(["POST"])
def update_profile(request):
    data = json.loads(request.body)
    user_id = data.get('id')
    username = data.get('username')
    email = data.get('email')

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)

    # if username:
    #     user.username = username
    if username:
        # Vérifie si un autre utilisateur utilise déjà ce username
        if User.objects.exclude(pk=user_id).filter(username=username).exists():
            # Si oui, renvoyez une erreur sans mettre à jour les informations de l'utilisateur
            return JsonResponse({"success": False, "message": "This username is already taken."}, status=400)

        user.username = username

    if email:
        user.email = email
    user.save()

    return JsonResponse({"success": True, "message": "User information updated successfully.", "username": user.username, "email": user.email})

@csrf_exempt
@verif_sessionID_extension
@require_http_methods(["GET"])
def get_profile(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)

    # Renvoi des informations de l'utilisateur
    return JsonResponse({
        "success": True,
        "message": "User information successfully retrieved.",
        "username": user.username,
        "email": user.email
    })

def oauth_callback(request):
    try:
        data = json.loads(request.body.decode('utf8'))
    except json.JSONDecodeError:
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)
    code = data.get('code')
    if code:
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH_CLIENT_ID,
            'client_secret': settings.OAUTH_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH_REDIRECT_URI,
        }
        response = requests.post("https://api.intra.42.fr/oauth/token", data=token_data, verify=False)
        if response.status_code == 200:
            access_token = response.json().get('access_token')
            try:
                profile_data = requests.get(
                    "https://api.intra.42.fr/v2/me",
                    headers={"Authorization": f"Bearer {access_token}"},
                    verify=False
                )
            except requests.RequestException as e:
                return JsonResponse({'error': 'Communication error with external service'}, status=503)
            if profile_data.status_code == 200:
                profile_data_json = profile_data.json()
                if not User.objects.filter(email=profile_data_json['email']).exists():
                    # Créez l'utilisateur s'il n'existe pas
                    user = User.objects.create_user(
                        username=profile_data_json['login'],
                        email=profile_data_json['email'],
                    )
                    user.set_password('Api42')
                    user.is_active = True
                    user.save()
                    register = True
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
                return JsonResponse({'error': f"Error retrieving profile data: {profile_data.status_code}"}, status=400)
            return JsonResponse({'message': 'Authentication successful', 'access_token': access_token, "username": user.username, "id": user.id, "email": user.email, "avatar": profile_data_json.get('image'), "firstname": profile_data_json.get('first_name'), "lastname": profile_data_json.get('last_name'), "register": register})
        else:
            return JsonResponse({'error': 'Error obtaining access token'}, status=400)
    else:
        return JsonResponse({'error': 'Missing authorization code'}, status=400)

@csrf_exempt
def verif_sessionID(request, session_id):

    if not session_id:
        return JsonResponse({'error': 'SessionID missing'}, status=400)

    try:
        # Vérifier si le sessionID existe
        session = Session.objects.get(session_key=session_id)
    except Session.DoesNotExist:
        return JsonResponse({'error': 'SessionID invalid'}, status=404)

    # Récupérer les données de session
    session_data = session.get_decoded()
    user_id = session_data.get('_auth_user_id')

    if not user_id:
        return JsonResponse({'error': 'User not found for this session'}, status=404)

    # Récupérer l'utilisateur associé à cette session
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Réponse de succès avec le nom d'utilisateur
    return JsonResponse({'success': 'Valid session', 'username': user.username, 'user_id': user.id}, status=200)


