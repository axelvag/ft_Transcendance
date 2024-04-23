# Todo
# [x] check au de debut de send invitation si une amitie est deja creait entre les deux ou une invitation a deja etait envoyer pour ce couple && check si l'invitation a etait accepte
# [x] ne pas retourne son username dans search
# [] check avant d'afficher les amis en ligne ou hors ligne si ils sont amis

# [x] Dans search -> retourner que des amis qu'ils ne sont pas encore amies.
# [] Bug quand on reject l'invitation, puis on re invite double , triple notification
# [] Mettre un compteur des invitations dans l'onglet invitation 

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
import requests
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()

@csrf_exempt
def verif_sessionID(view_func):
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('sessionid', None)
        update_url = f"https://authentification:8001/accounts/verif_sessionid/{session_id}"
        response = requests.get(update_url, verify=False)

        if response.status_code != 200:
            return JsonResponse({"success": False, "message": "SessionID Invalid"}, status=400)

        # Si la vérification est réussie, exécuter la vue originale
        return view_func(request, *args, **kwargs)

    return wrapper

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def send_invitation(request):
    data = json.loads(request.body)
    user_id = data.get('user_id')
    username = data.get('username')

    try:
        to_user = User.objects.get(username=username)
        from_user = User.objects.get(id=user_id)
        if from_user != to_user:
            # Vérifier si une invitation a été acceptée ou existe dans l'une ou l'autre direction
            invitation_query = Invitation.objects.filter(
                (Q(from_user=from_user) & Q(to_user=to_user)) | 
                (Q(from_user=to_user) & Q(to_user=from_user))
            )
            
            if invitation_query.exists():
                accepted_invitation = invitation_query.filter(accepted=True).exists()
                pending_invitation = invitation_query.filter(accepted=False).exists()

                if accepted_invitation:
                    # Une invitation entre ces utilisateurs a déjà été acceptée
                    return JsonResponse({
                        "status": "error",
                        "message": "A friendship already exists or an invitation has already been accepted."
                    }, status=409)
                elif pending_invitation:
                    # Une invitation en attente existe déjà entre ces utilisateurs
                    return JsonResponse({
                        "status": "error",
                        "message": "An invitation is already pending between these users."
                    }, status=409)
            
            # Aucune invitation existante ou acceptée, procéder à la création d'une nouvelle invitation
            invitation = Invitation.objects.create(from_user=from_user, to_user=to_user)
            Notification.objects.create(
                user=to_user,
                message=f"You have a new invitation from {from_user.username}.",
                invitation=invitation
            )

            ############################################
            notification = Notification.objects.create(
                user=to_user,
                message=f"You have a new invitation from {from_user.username}.",
                invitation=invitation
            )
            # Récupérer l'ID de la notification créée
            notification_id = notification.id
            logging.critical(notification_id)
            ############################################


            channel_layer = get_channel_layer()
            group_name = f"user{to_user.id}"

            # Envoyer une notification WebSocket au groupe de l'utilisateur destinataire
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "invitation_notification",
                    "message": f"You have a new invitation from {from_user.username}.",
                    "id": notification_id
                }
            )

            return JsonResponse({"status": "success", "message": "Invitation sent.", "invitation_id": invitation.id}, status=200)
        else:
            return JsonResponse({"status": "error", "message": "Cannot invite yourself."}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

@verif_sessionID
@require_http_methods(["GET"])
def search_users(request):
    search_query = request.GET.get('query', '')
    user_id = request.GET.get('user_id', None)

    if not search_query or not user_id or user_id.lower() == 'null':
        return JsonResponse({"status": "error", "message": "No search query or user ID provided."}, status=400)

    try:
        user_id = int(user_id)
    except ValueError:
        return JsonResponse({"status": "error", "message": "Invalid user ID provided."}, status=400)

    # récupére tous les identifiants des amis de l'utilisateur
    user_friends = Friendship.objects.filter(
        Q(user_id=user_id) | Q(friend_id=user_id)
    ).values_list('user_id', 'friend_id')

    friend_ids = {uid for pair in user_friends for uid in pair}
    friend_ids.add(user_id)

    users = User.objects.filter(
        (Q(username__icontains=search_query) |
         Q(first_name__icontains=search_query) |
         Q(last_name__icontains=search_query)) &
        ~Q(id__in=friend_ids) #exclure soit meme et si ils sont amies
    ).distinct()[:10]

    user_data = []
    for user in users:
        profile_info = get_profile_info(user.id)
        user_data.append({
            "username": user.username,
            "email": user.email,  # Supposant que vous avez accès à l'email directement depuis l'objet user
            "avatar_url": profile_info.get('avatar'),  # L'URL de l'avatar obtenue depuis l'API de profil
        })

    return JsonResponse(user_data, safe=False, status=200)
       
@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def accept_invitation(request):

    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')

    username = data.get('username')
    to_user = User.objects.get(username=username)

    try:
        # recherche l'invitation non accepte
        invitation = Invitation.objects.get(id=invitation_id, accepted=False)
        invitation.accepted = True
        invitation.save()

        # Création de la relation d'amitié dans les deux sens
        Friendship.objects.create(user=invitation.from_user, friend=invitation.to_user)
        Friendship.objects.create(user=invitation.to_user, friend=invitation.from_user)

        channel_layer = get_channel_layer()
        group_name = f"user{to_user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "accept_invitation",
                "message": "accept_invitation",
            }
        )

        return JsonResponse({"status": "success", "message": "Invitation accepted and friendship created."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def reject_invitation(request):

    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')

    username = data.get('username')
    to_user = User.objects.get(username=username)

    try:
        invitation = Invitation.objects.get(id=invitation_id, accepted=False)
        invitation.delete()

        channel_layer = get_channel_layer()
        group_name = f"user{to_user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "reject_invitation",
                "message": "reject_invitation",
            }
        )

        return JsonResponse({"status": "success", "message": "Invitation rejected."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)

# values_list est une methode QuerySet
# double underscore __ permet de traverser les relations entre modèles pour accéder aux attributs du modèle lié.
# flat retourne une liste aplatie ['ami1', 'ami2', 'ami3'], au lieu de [('ami1',), ('ami2',), ('ami3',)].

@verif_sessionID
@require_http_methods(["GET"])
def list_received_invitations(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        invitations = Invitation.objects.filter(to_user=user, accepted=False)
        invitations_data = []

        for invitation in invitations:
            from_user = invitation.from_user
            profile_info = get_profile_info(from_user.id)  # Récupère les informations du profil
            invitations_data.append({
                "from_user_username": from_user.username,
                "from_user_email": profile_info.get('email'),  # Email depuis le profil
                "from_user_avatar": profile_info.get('avatar'),  # Avatar URL depuis le profil
                "invitation_id": invitation.id,
            })
        
        return JsonResponse({"status": "success", "invitations": invitations_data}, safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

# affiche toutes les invitations envoyées par l'utilisateur qui n'ont pas encore été acceptées.
@verif_sessionID
@require_http_methods(["GET"])
def list_sent_invitations(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        invitations = Invitation.objects.filter(from_user=user, accepted=False)
        invitations_data = [] #[{"to_user": invitation.to_user.username, "invitation_id": invitation.id} for invitation in invitations]
        
        for invitation in invitations:
            # from_user = invitation.from_user
            # profile_info = get_profile_info(from_user.id)
            to_user = invitation.to_user
            profile_info = get_profile_info(to_user.id)
            invitations_data.append({
                "from_user_username": to_user.username,
                "from_user_email": profile_info.get('email'),  # Email depuis le profil
                "from_user_avatar": profile_info.get('avatar'),  # Avatar URL depuis le profil
                "invitation_id": invitation.id,
            })

        return JsonResponse({"status": "success", "invitations": invitations_data}, safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User does not exist."}, status=404)

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def cancel_sent_invitation(request):
    data = json.loads(request.body)
    invitation_id = data.get('invitation_id')

    username = data.get('username')
    to_user = User.objects.get(username=username)

    try:
        invitation = Invitation.objects.get(id=invitation_id, accepted=False)
        invitation.delete()

        channel_layer = get_channel_layer()
        group_name = f"user{to_user.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "cancel_invitation",
                "message": "cancel_invitation",
            }
        )
        
        return JsonResponse({"status": "success", "message": "Invitation cancelled."}, status=200)
    except Invitation.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invitation does not exist or has already been accepted."}, status=404)

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def remove_friend(request):
    data = json.loads(request.body)
    user_id = data.get('user_id')
    friend_id = data.get('friend_id')

    try:
        user = User.objects.get(id=user_id)
        friend = User.objects.get(id=friend_id)

        # suppressions des liens d'amitie
        Friendship.objects.filter(user=user, friend=friend).delete()
        Friendship.objects.filter(user=friend, friend=user).delete()

        # Suppression des invitations acceptées ou en attente entre ces utilisateurs
        Invitation.objects.filter(
            (Q(from_user=user) & Q(to_user=friend)) |
            (Q(from_user=friend) & Q(to_user=user))
        ).delete()
        
        channel_layer = get_channel_layer()
        group_name = f"user{friend_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "remove_friend",
                "message": "remove_friend",
            }
        )

        return JsonResponse({"status": "success", "message": "Friend removed."}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User or friend does not exist."}, status=404)

@verif_sessionID
@require_http_methods(["GET"])
def online_friends(request, user_id):
    try:
        friendships = Friendship.objects.filter(user_id=user_id)
        friend_ids = [friendship.friend.id for friendship in friendships]
        
        online_friends_data = []
        for friend_id in friend_ids:
            if UserStatus.objects.filter(user_id=friend_id, is_online=True).exists():
                user = User.objects.get(id=friend_id)
                profile_info = get_profile_info(user.id)
                online_friends_data.append({
                    "friend_id": user.id,
                    "username": user.username,
                    "email": profile_info.get('email'),
                    "avatar_url": profile_info.get('avatar'),
                })
        
        return JsonResponse({"online_friends": online_friends_data}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

@verif_sessionID
@require_http_methods(["GET"])
def offline_friends(request, user_id):
    try:
        friendships = Friendship.objects.filter(user_id=user_id)
        friend_ids = [friendship.friend.id for friendship in friendships]
        
        offline_friends_data = []
        for friend_id in friend_ids:
            if UserStatus.objects.filter(user_id=friend_id, is_online=False).exists():
                user = User.objects.get(id=friend_id)
                profile_info = get_profile_info(user.id)
                offline_friends_data.append({
                    "friend_id": user.id,
                    "username": user.username,
                    "email": profile_info.get('email'),
                    "avatar_url": profile_info.get('avatar'),
                })
        
        return JsonResponse({"offline_friends": offline_friends_data}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

def get_profile_info(user_id):
    profile_service_url = f"http://profile:8002/get_user_profile/{user_id}/"
    try:
        response = requests.get(profile_service_url)
        if response.status_code == 200:
            return response.json()
        else:
            return {}
    except requests.exceptions.RequestException:
        return {}

# def get_profile_info(user_id, cookies):
#     profile_service_url = f"https://profile:8002/get_user_profile/{user_id}/"
#     try:
#         response = requests.get(profile_service_url, cookies={'sessionid': cookies})
#         if response.status_code == 200:
#             return response.json()
#         else:
#             return {}
#     except requests.exceptions.RequestException:
#         return {}