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
# Create your views here.
User = get_user_model()

# def activate(request, uidb64, token):
#     User = get_user_model()
#     try:
#         uid = force_str(urlsafe_base64_decode(uidb64))
#         user = User.objects.get(pk=uid)
#     except:
#         user = None

#     if user is not None and account_activation_token.check_token(user,token):
#         user.is_active = True
#         user.save()

#         messages.success(request, "Thank you for your email confirmation. Now you can login your account.")
#         return redirect('accounts:login_user')
#     else:
#         messages.error(request, "Activation link is invalid!")

#     return redirect("Home:index")

# def activateEmail(request, user, to_email):
#     mail_subject = "Activate your user account"
#     message = render_to_string("template_activate_account.html", {
#         'user': user.username,
#         'domain': get_current_site(request).domain,
#         'uid': urlsafe_base64_encode(force_bytes(user.pk)),
#         'token': account_activation_token.make_token(user),
#         "protocol": 'https' if request.is_secure() else 'http'
#     })
#     email = EmailMessage(mail_subject, message, to=[to_email])
#     if email.send():
#         messages.success(request, f'Dear {user}, please go to you email {to_email} inbox and click on \
#                 received activation link to confirm and complete the registration. Note: Check your spam folder.')
#     else:
#         messages.error(request, f'Problem sending email to {to_email}, check if you typed it correctly.')

# def login_user(request):
#     if request.method == 'POST':
#         username_or_email = request.POST["username"]
#         password = request.POST["password"]

#         # Vérifier si l'entrée est un email ou un nom d'utilisateur
#         if '@' in username_or_email:
#             try:
#                 user = User.objects.get(email=username_or_email)
#                 username = user.username
#             except User.DoesNotExist:
#                 messages.info(request, "Identifiant ou mot de passe incorrect")
#                 return render(request, "accounts/login.html", {"form": UsernameOrEmailAuthenticationForm()})
#         else:
#             username = username_or_email

#         user = authenticate(request, username=username, password=password)

#         if user is not None:
#             login(request, user)
#             return redirect("Home:index")
#         else:
#             messages.info(request, "Identifiant ou mot de passe incorrect")

#     form = UsernameOrEmailAuthenticationForm()
#     return render(request, "accounts/login.html", {"form": form})

# def logout_user(request):
#     logout(request)
#     return redirect("Home:index")

# def register_user(request):
#     if request.method == 'POST':
#         form = UserCreationFormWithEmail(request.POST)
#         if form.is_valid():
#             user = form.save(commit=False)
#             user.is_active=False
#             user.save()
#             activateEmail(request, user, form.cleaned_data.get('email'))
#             return redirect("Home:index")
#     else:
#         form = UserCreationFormWithEmail()

#     return render(request, "accounts/register.html", {'form': form})

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

def login_user(request):
    if request.method == 'POST':
        username_or_email = request.POST["username"]
        password = request.POST["password"]
        user = None

        if '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(request, username=username_or_email, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({"success": True, "message": "Login successful."}, status=200)
        else:
            return JsonResponse({"success": False, "message": "Invalid username or password."}, status=HttpResponseBadRequest.status_code)

    return JsonResponse({"success": False, "message": "Invalid request method."}, status=HttpResponseBadRequest.status_code)

def logout_user(request):
    logout(request)
    return JsonResponse({"success": True, "message": "You have been logged out successfully."}, status=200)

def register_user(request):
    if request.method == 'POST':
        form = UserCreationFormWithEmail(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            activateEmail(request, user, form.cleaned_data.get('email'))
            return JsonResponse({"success": True, "message": "Registration successful. Please check your email to activate your account."}, status=200)
        else:
            print("yo")
            return JsonResponse({"success": False, "message": "Invalid form data."}, status=HttpResponseBadRequest.status_code)
    else:
        print("yoo")
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=HttpResponseBadRequest.status_code)

def get_csrf_token(request):
    """
    Vue pour obtenir le jeton CSRF et le renvoyer sous forme de réponse JSON.
    """
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})