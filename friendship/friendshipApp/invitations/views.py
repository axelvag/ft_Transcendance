# # Create your views here.

from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import Invitation
from django.views.decorators.csrf import csrf_exempt
from .models import Notification
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_POST
import json


User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def send_invitation(request):

    data = json.loads(request.body)
    user_id = data.get('user_id')
    username = data.get('username')

    # username = request.POST.get('username')  # Récupère le username du formulaire
    # from_user = request.user
    try:
        to_user = User.objects.get(username=username)  # Recherche l'utilisateur par son username
        from_user = User.objects.get(id=user_id)
        if from_user != to_user:
            if not Invitation.objects.filter(from_user=from_user, to_user=to_user).exists():
                Invitation.objects.create(from_user=from_user, to_user=to_user)
                # Mettre à jour les notifications pour le destinataire
                Notification.objects.create(
                    user=to_user,
                    message=f"You have a new invitation from {from_user.username}."
                )
                return JsonResponse({"status": "success", "message": "Invitation sent."}, status=200)
            else:
                return JsonResponse({"status": "error", "message": "Invitation already sent."}, status=409)
        else:
            return JsonResponse({"status": "error", "message": "Cannot invite yourself."}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def notifications(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user = User.objects.get(id=user_id)

        user_notifications = Notification.objects.filter(
            user=user, seen=False
        ).values('id', 'message', 'seen', 'created_at')
        
        # Convertir le QuerySet en liste pour la sérialisation JSON
        user_notifications_list = list(user_notifications)

        # Optionnellement, marquer les notifications comme vues
        Notification.objects.filter(user=user, seen=False).update(seen=True)

        return JsonResponse({"notifications": user_notifications_list}, status=200, safe=False)
    
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
