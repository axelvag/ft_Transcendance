# # Create your views here.

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import Notification, Friendship, Invitation, UserStatus
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_POST
import json
from django.db.models import F
import logging

User = get_user_model()

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# Channel_layer ==> permet de communiquer avec les WS asynchromes
#       send, receive

@csrf_exempt
@require_http_methods(["POST"])
def send_invitation(request):

    data = json.loads(request.body)
    user_id = data.get('user_id')
    username = data.get('username')

    try:
        to_user = User.objects.get(username=username)
        from_user = User.objects.get(id=user_id)
        if from_user != to_user:
            # Vérifier si une invitation n'a pas déjà été envoyée de cet expéditeur à ce destinataire
            if not Invitation.objects.filter(from_user=from_user, to_user=to_user).exists():
                invitation = Invitation.objects.create(from_user=from_user, to_user=to_user) # creation d'une nouvelle invitation 
                Notification.objects.create(
                    user=to_user,
                    message=f"You have a new invitation from {from_user.username}.",
                    invitation=invitation
                )

                logging.critical(invitation.id)

                channel_layer = get_channel_layer()

                group_name = f"user{to_user.id}"
                logging.critical(f"Envoi au groupe: {group_name}")

                # Envoyer une notification WebSocket au groupe de l'utilisateur destinataire
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "invitation_notification",
                        "message": f"You have a new invitation from {from_user.username}."
                    }
                )

                return JsonResponse({"status": "success", "message": "Invitation sent.", "invitation_id": invitation.id}, status=200)
            else:
                return JsonResponse({"status": "error", "message": "Invitation already sent."}, status=409)
        else:
            return JsonResponse({"status": "error", "message": "Cannot invite yourself."}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def accept_invitation(request):

    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')

    try:
        # recherche l'invitation non accepte
        invitation = Invitation.objects.get(id=invitation_id, accepted=false)
        invitation.accepted = true
        invitation.save()

        # Création de la relation d'amitié dans les deux sens
        Friendship.objects.create(user=invitation.from_user, friend=invitation.to_user)
        Friendship.objects.create(user=invitation.to_user, friend=invitation.from_user)

        return JsonResponse({"status": "success", "message": "Invitation accepted and friendship created."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def reject_invitation(request):

    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')

    try:
        invitation = Invitation.objects.get(id=invitation_id, accepted=false)
        invitation.delete()

        return JsonResponse({"status": "success", "message": "Invitation rejected."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)

# values_list est une methode QuerySet
# double underscore __ permet de traverser les relations entre modèles pour accéder aux attributs du modèle lié.
# flat retourne une liste aplatie ['ami1', 'ami2', 'ami3'], au lieu de [('ami1',), ('ami2',), ('ami3',)].
@require_http_methods(["GET"])
def get_list_friend(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        friends = user.friendships.values_list('friend__username', flat=True)
        
        return JsonResponse({"status": "success", "friends": list(friends)}, safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

# voir toutes les invitations d'amitié qu'il a reçues et qui sont en attente de réponse
@require_http_methods(["GET"])
def list_received_invitations(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        invitations = Invitation.objects.filter(to_user=user, accepted=False)
        invitations_data = [{"from_user": invitation.from_user.username, "invitation_id": invitation.id} for invitation in invitations]
        
        return JsonResponse({"status": "success", "invitations": invitations_data}, safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

# affiche toutes les invitations envoyées par l'utilisateur qui n'ont pas encore été acceptées.
@require_http_methods(["GET"])
def list_sent_invitations(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        invitations = Invitation.objects.filter(from_user=user, accepted=False)
        invitations_data = [{"to_user": invitation.to_user.username, "invitation_id": invitation.id} for invitation in invitations]
        
        return JsonResponse({"status": "success", "invitations": invitations_data}, safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def cancel_sent_invitation(request):
    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')

    try:
        invitation = Invitation.objects.get(id=invitation_id, accepted=False)
        invitation.delete()
        
        return JsonResponse({"status": "success", "message": "Invitation cancelled."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def remove_friend(request):
    data = json.loads(request.body)
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')

    try:
        user = User.objects.get(id=user_id)
        friend = User.objects.get(id=friend_id)
        Friendship.objects.filter(user=user, friend=friend).delete()
        Friendship.objects.filter(user=friend, friend=user).delete()
        
        return JsonResponse({"status": "success", "message": "Friend removed."}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User or friend does not exist."}, status=404)

@require_http_methods(["GET"])
def online_friends(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        friends = user.friends.all()
        online_friends = UserStatus.objects.filter(user__in=friends, is_online=True).values_list('user__username', flat=True)
        
        return JsonResponse({"online_friends": list(online_friends)}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

@require_http_methods(["GET"])
def offline_friends(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        friends = user.friends.all()
        offline_friends = UserStatus.objects.filter(user__in=friends, is_online=False).values_list('user__username', flat=True)
        
        return JsonResponse({"offline_friends": list(offline_friends)}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
