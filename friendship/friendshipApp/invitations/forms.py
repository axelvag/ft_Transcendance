# from django import forms
# from .models import Invitation

# class InvitationForm(forms.ModelForm):
#     class Meta:
#         model = Invitation
#         fields = ['to_email']

from django import forms
from django.contrib.auth.models import User
from .models import Invitation

class InvitationForm(forms.ModelForm):
    username = forms.CharField(max_length=150, help_text="Nom d'utilisateur de l'invité")

    class Meta: 
        model = Invitation
        fields = ['username']

    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            user = User.objects.get(username=username)
            if Invitation.objects.filter(to_user=user).exists():
                raise forms.ValidationError("Tu as déjà envoyé une demande d'ami à cet utilisateur.")
        except User.DoesNotExist:
            raise forms.ValidationError("Cet utilisateur n'existe pas.")
        return user
        # return username

    # def save(self, commit=True):
    #     invitation = super().save(commit=False)
    #     invitation.to_user = self.cleaned_data['username']
    #     if commit:
    #         invitation.save()
    #     return invitation
    def save(self, commit=True):
        invitation = super().save(commit=False)
        # Récupérez l'objet User correspondant au nom d'utilisateur et assignez-le à invitation.to_user
        username = self.cleaned_data['username']
        user = User.objects.get(username=username)
        invitation.to_user = user
        if commit:
            invitation.save()
        return invitation


# Pour la fonction clean_username : return username (retourne la variable plutot que l'objet User)
# Deuxieme fonction save --> test chatgpt me la generer pour debug