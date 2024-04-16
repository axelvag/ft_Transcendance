from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import json
from .models import Joueur, Tournoi, Match
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from django.db.models import Count
import requests
from django.db.models import Q

User = get_user_model()

@csrf_exempt
def verif_sessionID(view_func):
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('sessionid', None)
        update_url = f"http://authentification:8001/accounts/verif_sessionid/{session_id}"
        response = requests.get(update_url)
        
        if response.status_code != 200:
            return JsonResponse({"success": False, "message": "SessionID Invalid"}, status=400)
        
        # Si la vérification est réussie, exécuter la vue originale
        return view_func(request, *args, **kwargs)
    
    return wrapper

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def create_tournament(request):
    try:
        data = json.loads(request.body)
        name = data['tournamentName']
        max_players = data['tournamentSize']
        admin_id = data['admin_id']

        start_datetime = timezone.now() + timedelta(minutes=10)

        tournois = Tournoi(name=name, max_players=max_players, start_datetime=start_datetime, admin_id=admin_id)
        tournois.save()
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "Un nouveau tournoi a été créé"  # Message à envoyer aux clients
            }
        )
        logging.critical("Message WebSocket envoyé avec succès depuis la vue.")
        return JsonResponse({"success": True, "message": "Tournoi created successfully", "tournoi_id": tournois.id}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@verif_sessionID
@require_http_methods(["GET"])
def view(request):
    # Filtrez les tournois avec un status égal à 0 et annotez chaque tournoi avec le nombre de joueurs
    tournois = Tournoi.objects.filter(status=0).annotate(nombre_joueurs=Count('players'))

    # Préparez les données pour la réponse
    data = [
        {
            'id': tournoi.id,
            'name': tournoi.name,
            'status': tournoi.status,
            'max_players': tournoi.max_players,
            'start_datetime': tournoi.start_datetime,
            'nombre_joueurs': tournoi.nombre_joueurs  # Inclure le nombre de joueurs ici
        }
        for tournoi in tournois
    ]

    # Retournez les données en JSON
    return JsonResponse(data, safe=False, status = 200)


@verif_sessionID
@require_http_methods(["GET"])
def tournament_detail(request, tournament_id):
    try:
        # Essayez de récupérer le tournoi par son ID
        tournament = Tournoi.objects.get(pk=tournament_id)
        
        # Préparez les données à renvoyer si le tournoi est trouvé
        data = {
            'success': True,
            'data': {
                'id': tournament.id,
                'name': tournament.name,
                'maxPlayer': tournament.max_players,
                'admin_id': tournament.admin_id,
                # Ajoutez d'autres champs selon votre modèle
            }
        }
    except Tournoi.DoesNotExist:
        # Si le tournoi n'est pas trouvé, renvoyez success: false avec un message d'erreur
        data = {
            'success': False,
            'error': "Tournoi non trouvé."
        }
    # Renvoie les données en format JSON
    return JsonResponse(data)

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def create_joueur(request):
    try:
        data = json.loads(request.body.decode('utf8'))
        print("Received data:", data)
    except json.JSONDecodeError:
        return JsonResponse(data={'errors': "Invalid JSON format"}, status=406)

    username = data.get('username')
    user_id = data.get('user_id')
    tournament_id = data.get('tournament_id')

    if not (username and user_id and tournament_id):
        return JsonResponse({'error': 'Missing data'}, status=400)

    try:
        tournament = Tournoi.objects.get(pk=tournament_id)
    except Tournoi.DoesNotExist:
        return JsonResponse({'error': 'Tournoi not found'}, status=404)

    # Utiliser get_or_create pour éviter de créer un doublon
    joueur, created = Joueur.objects.get_or_create(
        user_id=user_id, 
        tournament_id=tournament_id, 
        defaults={'username': username, 'tournament': tournament}
    )
    if created:
        tournament_group_name = f"tournoi_{tournament_id}"

        # Envoi du message au groupe de canaux spécifique du tournoi
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            tournament_group_name,  # Nom du groupe modifié pour être unique par tournoi
            {
                "type": "add_player",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                "message": "Un nouveau joueur a été ajouté au tournoi"
            }
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "Un nouveau tournoi a été créé"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({"success": True, 'message': 'Joueur created successfully', 'joueur_id': joueur.id})
    else:
        return JsonResponse({"success": False, 'message': 'Joueur already exists', 'joueur_id': joueur.id})


@verif_sessionID
@require_http_methods(["GET"])
def view_joueur(request, tournament_id):
    # Filtrez les tournois avec un status égal à 0
    joueur = Joueur.objects.filter(tournament=tournament_id)

    # Préparez les données pour la réponse
    # Note : Adaptez les champs 'name', 'max_players', etc., selon votre modèle
    data = list(joueur.values('user_id', 'username'))

    # Retournez les données en JSON
    return JsonResponse(data, safe=False)

@verif_sessionID
@require_http_methods(["GET"])
def tournoi_info(request, user_id):
    try:
        # Trouver le joueur et son tournoi associé
        joueur = Joueur.objects.filter(user_id=user_id).select_related('tournament').first()
        
        if joueur and joueur.tournament:  # Vérification ajoutée ici
            tournoi = joueur.tournament
            tournoi_info = {
                "id": tournoi.id,
                "name": tournoi.name,
                "maxPlayer": tournoi.max_players,
                "admin_id": tournoi.admin_id,
            }
            return JsonResponse(tournoi_info)
        else:
            return JsonResponse({'error': 'Joueur not found or not associated with a tournament'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@verif_sessionID
@require_http_methods(["DELETE"])
def delete_joueur(request, user_id):
    try:
        # Trouver tous les joueurs correspondants à user_id, supposant qu'un user_id puisse avoir plusieurs entrées
        joueurs = Joueur.objects.filter(user_id=user_id)
        
        user_group_name = f"user_{user_id}"
        for joueur in joueurs:
            tournament_id = joueur.tournament_id  # Récupération de l'ID du tournoi avant la suppression
            joueur.delete()

            # Construire le nom du groupe de canaux pour le tournoi spécifique
            tournament_group_name = f"tournoi_{tournament_id}"

            # Envoi du message au groupe de canaux spécifique du tournoi pour notifier la suppression du joueur
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                tournament_group_name,  # Utiliser le nom du groupe basé sur l'ID du tournoi
                {
                    "type": "add_player",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                    "message": "Un joueur a été supprimé du tournoi"
                }
            )
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(user_group_name, {
                'type': 'websocket.send',
                'text': json.dumps({'action': 'disconnect'})
            })
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
                {
                    "type": "tournoi_cree",  # Type de message
                    "message": "Un nouveau tournoi a été créé"  # Message à envoyer aux clients
                }
            )
        return JsonResponse({"success": True, 'message': 'Joueur(s) deleted successfully'})

    except Joueur.DoesNotExist:
        return JsonResponse({'error': 'Joueur not found'}, status=404)

@csrf_exempt
@verif_sessionID
@require_http_methods(["DELETE"])
def delete_tournoi(request, tournoi_id):
    try:
        # Trouver le tournoi par son ID
        tournoi = Tournoi.objects.get(pk=tournoi_id)
        # Supprimer le tournoi. Tous les joueurs liés seront également supprimés grâce à on_delete=models.CASCADE
        tournoi.delete()
        # Construire le nom du groupe de canaux pour le tournoi spécifique
        tournament_group_name = f"tournoi_{tournoi_id}"

        # Envoi du message au groupe de canaux spécifique du tournoi pour notifier la suppression du joueur
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            tournament_group_name,  # Utiliser le nom du groupe basé sur l'ID du tournoi
            {
                "type": "delete_tournament",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                "message": "Un tournoi a été supprimé"
            }
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "Un nouveau tournoi a été créé"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({'success': True, 'message': 'Tournoi and all associated players have been deleted.'})
    except Tournoi.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Tournoi not found.'}, status=404)
    except Exception as e:
        # Pour capturer d'autres erreurs potentielles
        return JsonResponse({'success': False, 'message': 'An error occurred: {}'.format(str(e))}, status=500)


# @csrf_exempt
# @verif_sessionID
# @require_http_methods(["POST"])
# def start_tournament(request, tournament_id):
#     try:
#         tournament = Tournoi.objects.get(pk=tournament_id)
#         tournament.status = Tournoi.IN_PROGRESS
#         tournament.save()
#         return JsonResponse({'message': 'Tournoi mis à jour avec succès en cours.'}, status=200)
#     except Tournoi.DoesNotExist:
#         return JsonResponse({'error': 'Tournoi non trouvé.'}, status=404)


# import random

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def create_matches(request, tournament_id):
    # Vérifier si le tournoi est dans un état approprié pour créer des matchs
    tournament = Tournoi.objects.get(id=tournament_id)
    if Match.objects.filter(tournament=tournament).exists():
        return JsonResponse({'success': True, "message": "Matches already created for this tournament"}, status=200)
    tournament = None
    tournament = Tournoi.objects.filter(id=tournament_id, status=Tournoi.CREATED).first()
    if not tournament:
        return JsonResponse({"error": "Le tournoi n'est pas dans un état valide pour créer des matchs."}, status=400)

    # Récupérer tous les joueurs du tournoi
    players = list(Joueur.objects.filter(tournament=tournament_id))
    if len(players) % 2 != 0:
        return JsonResponse({"error": "Nombre impair de joueurs, impossible de créer des matchs pairs."}, status=400)

    # Mélanger la liste des joueurs pour randomiser les appariements
    # random.shuffle(players)

    # Créer les matchs en associant les joueurs deux à deux
    matches_created = []
    for i in range(0, len(players), 2):
        match = Match.objects.create(
            player_1=players[i],
            player_2=players[i+1],
            tournament=tournament,  # Associer le match au tournoi spécifique
            status=Match.NOT_PLAYED  # Initialiser le statut du match à 'Non joué'
        )
        matches_created.append(match)

    # Mettre à jour le statut du tournoi pour indiquer que les matchs sont en cours
    tournament.status = Tournoi.IN_PROGRESS
    tournament.save()

    return JsonResponse({'success': True, "message": f"Les matchs ont été créés avec succès. Nombre de matchs créés: {len(matches_created)}."}, status=201)

@verif_sessionID
@require_http_methods(["GET"])
def get_matches(request, tournament_id):
    try:
        cookies = request.COOKIES.get('sessionid', None)
        matches = Match.objects.filter(tournament_id=tournament_id)

        matches_data = []
        for match in matches:
            # Obtenir les informations de profil pour chaque joueur
            profile_info1 = get_profile_info_cookie(match.player_1.user_id, cookies)
            profile_info2 = get_profile_info_cookie(match.player_2.user_id, cookies)

            # Ajouter les informations du match à la liste
            matches_data.append({
                "match_id": match.id,
                "player_1_id": match.player_1.user_id,
                "player_1_username": match.player_1.username,
                "player_1_avatar": profile_info1.get('avatar'),
                "player_2_id": match.player_2.user_id,
                "player_2_username": match.player_2.username,
                "player_2_avatar": profile_info2.get('avatar'),
                "status": match.status,
                "player_1_ready": match.player_1.status_ready,
                "player_2_ready": match.player_2.status_ready,
            })

        # Renvoyez les données JSON avec 'success' et les données des matchs
        return JsonResponse({'success': True, 'matches': matches_data}, safe=False)

    except Tournoi.DoesNotExist:
        # Gérez le cas où le tournoi n'existe pas
        return JsonResponse({'error': "Tournoi non trouvé."}, status=404)


@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def set_player_ready(request, player_id):
    try:
        player = Joueur.objects.get(user_id=player_id)

        # Bascule l'état de préparation du joueur
        if player.status_ready == Joueur.READY:
            player.status_ready = Joueur.NOT_READY
        else:
            player.status_ready = Joueur.READY
        player.save()

        # Récupérez le match correspondant au joueur
        match = Match.objects.filter(Q(player_1=player) | Q(player_2=player)).first()
        if not match:
            return JsonResponse({"success": False, "error": "Match correspondant non trouvé."}, status=404)

        # Vérifiez si les deux joueurs sont prêts
        if match.player_1.status_ready == Joueur.READY and match.player_2.status_ready == Joueur.READY:
            match.status = Match.IN_PROGRESS
            match.save()
            return JsonResponse({"success": True, "match_started": True})
        
        return JsonResponse({"success": True, "match_started": False, "player_status": player.status_ready})

    except Joueur.DoesNotExist:
        return JsonResponse({"success": False, "error": "Joueur non trouvé."}, status=404)



def get_profile_info_cookie(user_id, cookies):
    profile_service_url = f"http://profile:8002/get_user_profile/{user_id}/"
    try:
        response = requests.get(profile_service_url, cookies={'sessionid': cookies})
        if response.status_code == 200:
            return response.json()
        else:
            return {}
    except requests.exceptions.RequestException:
        return {}


import math


@csrf_exempt
@verif_sessionID
@require_http_methods(["GET"])
def get_next_rounds(request, tournament_id):
    try:
        # Récupérer le tournoi
        tournament = Tournoi.objects.get(id=tournament_id)
        
        # Calculer le nombre de joueurs et le nombre de tours nécessaires
        num_players = tournament.players.count()
        current_round = 1  # Remplacez ceci par le tour actuel du tournoi
        remaining_players = num_players - 2**(current_round - 1)  # Nombre de joueurs restants après le tour actuel
        remaining_rounds = math.ceil(math.log2(remaining_players))  # Nombre de tours restants après le tour actuel

        # Générer les tours restants avec l'état d'attente
        rounds_data = []
        for i in range(current_round + 1, current_round + 1 + remaining_rounds):
            round_info = {
                "round": i,
                "matches": []  # Liste vide pour indiquer un tour vide
            }
            rounds_data.append(round_info)

        # Renvoyer les données JSON avec les tours restants
        return JsonResponse({"success": True, "rounds": rounds_data})

    except Tournoi.DoesNotExist:
        return JsonResponse({"success": False, "error": "Tournoi non trouvé."}, status=404)

