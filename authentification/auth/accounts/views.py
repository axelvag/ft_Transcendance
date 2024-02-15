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
    message = render_to_string("template_activate_account.html", {
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
                return JsonResponse({"success": True, "message": "Login successful.", "username": user.username}, status=200)
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
    """
    Vue pour obtenir le jeton CSRF et le renvoyer sous forme de réponse JSON.
    """
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})

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
            user = User.objects.get(email=email)
            if user is not None:
                to_email = user.email
                mail_subject = "Réinitialisation de votre mot de passe sur Transcendence"
                message = render_to_string("template_forget_pass.html", {
                    'user': user.username,
                    'domain': get_current_site(request).domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': account_activation_token.make_token(user),
                    "protocol": 'https' if request.is_secure() else 'http'
                })
                email = EmailMessage(mail_subject, message, to=[to_email])
                if email.send():
                    return JsonResponse({"success": True, "message": f'Dear {user}, please go to your email {to_email} inbox and click on the received activation link to confirm the renitialisation of your password.'}, status=200)
                else:
                    return JsonResponse({"success": False, "message": f'Problem sending email to {to_email}, check if you typed it correctly.'}, status=HttpResponseServerError.status_code)
            else:
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


def delete_user(request, username):

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
        return JsonResponse({"success": True, "message": "User is login.", "username": request.user.username, "email": request.user.email}, status=200)
    else:
        return JsonResponse({"success": False, "message": "User is not login."}, status=400)