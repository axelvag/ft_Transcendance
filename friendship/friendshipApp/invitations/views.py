# # Create your views here.

# from django.shortcuts import render, redirect
# from .forms import InvitationForm
# from .models import Invitation
# from django.contrib.auth.decorators import login_required

# # @login_required
# def home(request):
#     if request.method == "POST":
#         form = InvitationForm(request.POST)
#         if form.is_valid():
#             invitation = form.save(commit=False)
#             invitation.from_user = request.user
#             invitation.save()
#             # Ici, vous pourriez également envoyer un email d'invitation
#             return redirect('home')
#     else:
#         form = InvitationForm()
#     return render(request, 'invitations/home.html', {'form': form})

# # Vous pouvez ajouter plus de vues pour gérer l'acceptation ou le refus d'invitations.

from django.shortcuts import render, redirect, get_object_or_404
from .forms import InvitationForm
from .models import Invitation
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required
def home(request):
    if request.method == "POST":
        form = InvitationForm(request.POST)
        if form.is_valid():
            invitation = form.save(commit=False)
            invitation.from_user = request.user
            invitation.save()
            messages.success(request, "L'invitation a été envoyée avec succès !")
            return redirect('home')
    else:
        form = InvitationForm()
    invitations = Invitation.objects.filter(to_email=request.user.email, accepted=False)
    return render(request, 'invitations/home.html', {'form': form, 'invitations': invitations})

# @login_required
# def accept_invitation(request, invitation_id):
#     invitation = get_object_or_404(Invitation, id=invitation_id, to_email=request.user.email, accepted=False)
#     invitation.accepted = True
#     invitation.save()
#     messages.success(request, "L'invitation a été acceptée.")
#     return redirect('home')

# # @login_required
# def reject_invitation(request, invitation_id):
#     invitation = get_object_or_404(Invitation, id=invitation_id, to_email=request.user.email)
#     invitation.delete()
#     messages.info(request, "L'invitation a été rejetée.")
#     return redirect('home')
