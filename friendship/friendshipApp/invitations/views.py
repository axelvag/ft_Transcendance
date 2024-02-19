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
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


@login_required
@csrf_exempt
def home(request):
    if not request.user.is_authenticated:
        print("Pusssyyyyyyyyyyyyyyyyyyyyyyyy")

    try:
        data = json.loads(request.body.decode('utf8'))
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON format"}, status=406)

    print("data-->", data)
    
    if request.method == "POST":
        # form = InvitationForm(request.POST)
        form = InvitationForm(data)
        # print("salut", form)
        if form.is_valid():
            invitation = form.save(commit=False)
            invitation.from_user = request.user
            invitation.save()
            # messages.success(request, "L'invitation a été envoyée avec succès !")
            # return redirect('home')
            return JsonResponse({"message": "L'invitation a été envoyée avec succès !"}, status=200)
        else:
            print("hellooooo")
            return JsonResponse(form.errors, status=400)
    else:
        form = InvitationForm()
        # Query for invitations should match the expected field (to_user or to_email)
        invitations = Invitation.objects.filter(to_user=request.user, accepted=False)
        # Serialize your invitations data to JSON
        invitations_data = list(invitations.values('from_user__username', 'accepted'))
        # Return a JSON response with the form and invitations data
        return JsonResponse({
            'form': form.as_p(),  # You might want to handle form rendering on the frontend instead
            'invitations': invitations_data,
        })