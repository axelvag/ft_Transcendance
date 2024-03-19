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
from django.db.models import F
import logging

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
                invitation = Invitation.objects.create(from_user=from_user, to_user=to_user)
                # Mettre à jour les notifications pour le destinataire
                Notification.objects.create(
                    user=to_user,
                    message=f"You have a new invitation from {from_user.username}.",
                    invitation=invitation
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
        ).prefetch_related('invitation').values(
            'id', 'message', 'seen', 'created_at', 
            'invitation_id', 
            from_user_id=F('invitation__from_user_id'), 
            to_user_id=F('invitation__to_user_id')
        )
        # ).values('id', 'message', 'seen', 'created_at')
        
        # Convertir le QuerySet en liste pour la sérialisation JSON
        user_notifications_list = list(user_notifications)

        # Optionnellement, marquer les notifications comme vues
        Notification.objects.filter(user=user, seen=False).update(seen=True)

        return JsonResponse({"notifications": user_notifications_list}, status=200, safe=False)
    
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

# accept-invitation ==> deviens amis 
# reject-invitation ==> supprime la demande d'amis

@csrf_exempt
@require_http_methods(["POST"])
def accept_invitation(request):
    try:
        data = json.loads(request.body)
        invitation_id = data.get('invitation_id')
        user_id = data.get('user_id')  # L'ID de l'utilisateur acceptant l'invitation

        # Trouver l'invitation correspondante
        invitation = Invitation.objects.get(id=invitation_id, to_user_id=user_id, accepted=False)

        # Marquer l'invitation comme acceptée
        invitation.accepted = True
        invitation.save()

        # Ici, vous pouvez ajouter la logique pour créer une relation d'amitié
        # entre invitation.from_user et invitation.to_user

        return JsonResponse({"status": "success", "message": "Invitation accepted."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def get_friends(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user = User.objects.get(id=user_id)
        
        logging.critical(user_id)
        logging.critical(user)

        # Récupérer les amis où l'utilisateur est le destinataire de l'invitation acceptée
        friends_from_invitations = User.objects.filter(
            invitations_received__from_user=user,
            invitations_received__accepted=True
        ).distinct()

        logging.critical("Yo")

        # Récupérer les amis où l'utilisateur est l'expéditeur de l'invitation acceptée
        friends_to_invitations = User.objects.filter(
            invitations_sent__to_user=user,
            invitations_sent__accepted=True
        ).distinct()

        logging.critical("Yo2")

        # Fusionner les deux listes d'amis sans doublons
        friends = (friends_from_invitations | friends_to_invitations).distinct()
        logging.critical("Yo3")

        # Préparer les données des amis pour la réponse JSON
        friends_data = list(friends.values('id', 'username'))
        logging.critical("Yo4")

        return JsonResponse({"status": "success", "friends": friends_data}, status=200)

    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
