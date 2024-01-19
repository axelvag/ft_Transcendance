from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


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


class UsernameOrEmailAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label="Username ou Email")