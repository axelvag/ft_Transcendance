# Todo
# [] check au de debut de send invitation si une amitie est deja creait entre les deux ou une invitation a deja etait envoyer pour ce couple && check si l'invitation a etait accepte
# [] ne pas retourne son username dans search
# [] check avant d'afficher les amis en ligne ou hors ligne si ils sont amis

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import Notification, Friendship, Invitation, UserStatus
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_POST
import json
from django.db.models import F
from django.db.models import Q
import logging

User = get_user_model()

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# Channel_layer ==> permet de communiquer avec les WS asynchromes
#       send, receive

# @csrf_exempt
# @require_http_methods(["POST"])
# def send_invitation(request):

#     data = json.loads(request.body)
#     user_id = data.get('user_id')
#     username = data.get('username')

#     try:
#         to_user = User.objects.get(username=username)
#         from_user = User.objects.get(id=user_id)
#         if from_user != to_user:
#             # Vérifier si une invitation n'a pas déjà été envoyée de cet expéditeur à ce destinataire
#             if not Invitation.objects.filter(from_user=from_user, to_user=to_user).exists():
#                 invitation = Invitation.objects.create(from_user=from_user, to_user=to_user) # creation d'une nouvelle invitation 
#                 Notification.objects.create(
#                     user=to_user,
#                     message=f"You have a new invitation from {from_user.username}.",
#                     invitation=invitation
#                 )

#                 logging.critical(invitation.id)

#                 channel_layer = get_channel_layer()

#                 group_name = f"user{to_user.id}"
#                 logging.critical(f"Envoi au groupe: {group_name}")

#                 # Envoyer une notification WebSocket au groupe de l'utilisateur destinataire
#                 async_to_sync(channel_layer.group_send)(
#                     group_name,
#                     {
#                         "type": "invitation_notification",
#                         "message": f"You have a new invitation from {from_user.username}."
#                     }
#                 )

#                 return JsonResponse({"status": "success", "message": "Invitation sent.", "invitation_id": invitation.id}, status=200)
#             else:
#                 return JsonResponse({"status": "error", "message": "Invitation already sent."}, status=409)
#         else:
#             return JsonResponse({"status": "error", "message": "Cannot invite yourself."}, status=400)
#     except User.DoesNotExist:
#         return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

# check aussi si l'invitation a etait accepter
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
            # Vérifier si une invitation n'a pas déjà été envoyée dans l'une ou l'autre direction
            existing_invitation = Invitation.objects.filter(
                (Q(from_user=from_user) & Q(to_user=to_user)) | 
                (Q(from_user=to_user) & Q(to_user=from_user)),
                accepted=False
            ).first()

            if existing_invitation:
                if existing_invitation.from_user == to_user:
                    # Une invitation existe déjà de la part du destinataire vers l'expéditeur
                    return JsonResponse({
                        "status": "info",
                        "message": "You have already received a friendship request from this user. Please check your invitations."
                    }, status=200)
                else:
                    # Une invitation a déjà été envoyée à cet utilisateur
                    return JsonResponse({"status": "error", "message": "Invitation already sent."}, status=409)
            else:
                # Aucune invitation existante, procéder à la création d'une nouvelle invitation
                invitation = Invitation.objects.create(from_user=from_user, to_user=to_user)
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
            return JsonResponse({"status": "error", "message": "Cannot invite yourself."}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

# gerer de pas s'affiche sois
@require_http_methods(["GET"])
def search_users(request):
    search_query = request.GET.get('query', '')
    
    if search_query:
        # Utilisez `__icontains` pour la recherche insensible à la casse
        # et `distinct()` pour éviter les doublons.
        user_list = User.objects.filter(
            Q(username__icontains=search_query) | 
            Q(first_name__icontains=search_query) | 
            Q(last_name__icontains=search_query)
        ).distinct().values_list('username', flat=True)[:10]
        
        return JsonResponse(list(user_list), safe=False, status=200)
    else:
        return JsonResponse({"status": "error", "message": "No search query provided."}, status=400)
# @require_http_methods(["GET"])
# def search_users(request):
#     search_query = request.GET.get('query', '')
#     # Assurez-vous de convertir l'`user_id` en entier car les IDs dans Django sont des entiers par défaut
#     user_id = request.GET.get('user_id', None)

#     if search_query:
#         query_filter = Q(username__icontains=search_query) | Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query)

#         if user_id:
#             try:
#                 # Convertir user_id en int avant de l'utiliser dans le filtre
#                 user_id = int(user_id)
#                 query_filter &= ~Q(id=user_id)
#             except ValueError:
#                 # Si la conversion échoue, retourner une erreur ou ignorer le filtre user_id
#                 return JsonResponse({"status": "error", "message": "Invalid user ID provided."}, status=400)

#         user_list = User.objects.filter(query_filter).distinct().values_list('username', flat=True)[:10]

#         return JsonResponse(list(user_list), safe=False, status=200)
#     else:
#         return JsonResponse({"status": "error", "message": "No search query provided."}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def accept_invitation(request):

    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')
    logging.critical(invitation_id)

    try:
        # recherche l'invitation non accepte
        invitation = Invitation.objects.get(id=invitation_id, accepted=False)
        invitation.accepted = True
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
        invitation = Invitation.objects.get(id=invitation_id, accepted=False)
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
        # Récupérer les instances User des amis
        friendships = Friendship.objects.filter(user_id=user_id)
        friend_ids = [friendship.friend.id for friendship in friendships]
        
        online_friends = UserStatus.objects.filter(
            user_id__in=friend_ids, is_online=True
        ).values_list('user__username', flat=True)
        
        return JsonResponse({"online_friends": list(online_friends)}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

@require_http_methods(["GET"])
def offline_friends(request, user_id):
    try:
        # Récupérer les instances User des amis
        friendships = Friendship.objects.filter(user_id=user_id)
        friend_ids = [friendship.friend.id for friendship in friendships]
        
        offline_friends = UserStatus.objects.filter(
            user_id__in=friend_ids, is_online=False
        ).values_list('user__username', flat=True)
        
        return JsonResponse({"offline_friends": list(offline_friends)}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)