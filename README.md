# Authentification

> the goal is to create the authentification for our site web with a confirmation email for the registered account.

## Django Setup

At first i have to install django : a FrameWork of Python for web developpement.

``` bash
python -m venv env
```
I use this command then the virtual environment was created in our directory django-web-app afterwards i create the admin project name auth(authentification) with this command :

``` bash
django-admin startproject merchex
```

thanks to django the file includes a lot of things who will be usefull like a settings.py who includes all the apps for the authentification.

``` Python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'Home',
]
```

there is also the file urls.py who include the path of the several pages of the site
``` Python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('Home/', include('Home.urls')),
    path('accounts/', include('accounts.urls'))
]
```
## Athentification developpement

Next i create a secondary app name Home who include the html for the page sign in and sign up but the main things is the third application accounts in this application there is several path login/ registered/ logout/ and activate/: the urls.py of accounts

``` Python
from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('register/', views.register_user, name='register_user'),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
]
```

At first i create register in the views the primary function of views.py is to receive web requests and return web responses. Each view in this file is responsible for processing incoming requests, performing any necessary logic, and returning the appropriate response to the user.

``` Python
def register_user(request):
    if request.method == 'POST':
        form = UserCreationFormWithEmail(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active=False
            user.save()
            activateEmail(request, user, form.cleaned_data.get('email'))
            return redirect("Home:index")
    else:
        form = UserCreationFormWithEmail()

    return render(request, "accounts/register.html", {'form': form})
```
The provided code is a Django view function named register_user, which handles the user registration process. Here's a summary of its functionality:

The function first checks if the incoming request is a POST request If it's a POST request, the function creates an instance of UserCreationFormWithEmail who is the UserCreationForm give by django but update with a email field

``` Python
class UserCreationFormWithEmail(UserCreationForm):
    email = forms.EmailField(required=True, help_text='Requis. Entrez une adresse email valide.')

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(UserCreationFormWithEmail, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user
```

The user is created but not immediately saved to the database (commit=False). This allows for modifications to the user object before it's saved.
The user's is_active attribute is set to False, indicating that the user account will need to be activated (like email verification) before it can be used.
The user is then saved to the database.

The function activateEmail is called, passing the request, user object, and the user's email. This function likely handles sending an activation email to the user.

``` Python
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
        messages.success(request, f'Dear {user}, please go to you email {to_email} inbox and click on \
                received activation link to confirm and complete the registration. Note: Check your spam folder.')
    else:
        messages.error(request, f'Problem sending email to {to_email}, check if you typed it correctly.')
```
### For generate the token 

``` Python
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.is_active}"

account_activation_token = AccountActivationTokenGenerator()
```

### I use a html tmeplate for the mail send

``` h
{% autoescape off %}
Hi {{ user.username }},

Please click on the link below to confirm your registration:

{{ protocol }}://{{ domain }}{% url 'accounts:activate' uidb64=uid token=token %}
{% endautoescape %}
```
### When the user clic that active his acompte with the function activate 

``` Python
def activate(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except:
        user = None

    if user is not None and account_activation_token.check_token(user,token):
        user.is_active = True
        user.save()

        messages.success(request, "Thank you for your email confirmation. Now you can login your account.")
        return redirect('accounts:login_user')
    else:
        messages.error(request, "Activation link is invalid!")

    return redirect("Home:index")
```
### When the user is activate the link redirect the user in the login page

``` Python
def login_user(request):
    if request.method == 'POST':
        username_or_email = request.POST["username"]
        password = request.POST["password"]

        # Vérifier si l'entrée est un email ou un nom d'utilisateur
        if '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
                username = user.username
            except User.DoesNotExist:
                messages.info(request, "Identifiant ou mot de passe incorrect")
                return render(request, "accounts/login.html", {"form": UsernameOrEmailAuthenticationForm()})
        else:
            username = username_or_email

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("Home:index")
        else:
            messages.info(request, "Identifiant ou mot de passe incorrect")

    form = UsernameOrEmailAuthenticationForm()
    return render(request, "accounts/login.html", {"form": form})
```
The function first checks if the incoming request is a POST request, which indicates that login credentials have been submitted.
If it's a POST request, the function retrieves the username (or email) and password from the request.

The function checks if the provided username is actually an email address (by looking for an '@' symbol).
If it is an email, it tries to fetch the user from the database using the email. If the user is found, it retrieves the associated username.
If the user is not found (or if the provided credential is not an email), it assumes the input is a username.

Using Django's authenticate function, it attempts to verify the credentials. If the credentials are correct, authenticate returns the user object; otherwise, it returns None.

And i have the function logout_user

``` Python
def logout_user(request):
    logout(request)
    return redirect("Home:index")
```