# Create your views here.

from django.shortcuts import render, redirect
from .forms import InvitationForm
from .models import Invitation
from django.contrib.auth.decorators import login_required

# @login_required
def home(request):
    if request.method == "POST":
        form = InvitationForm(request.POST)
        if form.is_valid():
            invitation = form.save(commit=False)
            invitation.from_user = request.user
            invitation.save()
            # Ici, vous pourriez également envoyer un email d'invitation
            return redirect('home')
    else:
        form = InvitationForm()
    return render(request, 'invitations/home.html', {'form': form})

# Vous pouvez ajouter plus de vues pour gérer l'acceptation ou le refus d'invitations.
