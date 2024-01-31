from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('register/', views.register_user, name='register_user'),
    path('password_reset/', views.password_reset, name='password_reset_'),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('is_user_active/<uidb64>/<token>', views.is_user_active, name='is_user_active'),
    path('resend_email_confirmation/<uidb64>', views.resend_email_confirmation, name='resend_email_confirmation'),
]