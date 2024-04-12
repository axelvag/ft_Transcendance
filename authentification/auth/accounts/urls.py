from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('register/', views.register_user, name='register_user'),
    path('password_reset/', views.password_reset, name='password_reset_'),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
    path('activate_mail_pass/<uidb64>/<token>', views.activate_mail_pass, name='activate_mail_pass'),
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('is_user_active/<uidb64>/<token>', views.is_user_active, name='is_user_active'),
    path('resend_email_confirmation/<uidb64>', views.resend_email_confirmation, name='resend_email_confirmation'),
    path('resend_email_rest/<uidb64>', views.resend_email_rest, name='resend_email_rest'),
    path('password-change/<uidb64>', views.password_change, name='password_change'),
    path('delete_user/<username>', views.delete_user, name='delete_user'),
    path('is_user_logged_in/', views.is_user_logged_in, name='is_user_logged_in'),
    path('update_profile/', views.update_profile, name='update_profile'),
    path('get_profile/<int:user_id>/', views.get_profile, name='get_profile'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback'),
    path('verif_sessionid/<str:session_id>/', views.verif_sessionID, name='verif_sessionID'),
]