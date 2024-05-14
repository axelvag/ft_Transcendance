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
from collections import defaultdict
from django.db import transaction
from django.db.models import F

User = get_user_model()

@csrf_exempt
def verif_sessionID(view_func):
    def wrapper(request, *args, **kwargs):
        session_id = request.COOKIES.get('sessionid', None)
        update_url = f"https://authentification:8001/accounts/verif_sessionid/{session_id}"
        try:
            response = requests.get(update_url, verify=False)
        except requests.RequestException as e:
                print(f"HTTP request error: {e}")
                return JsonResponse({'error': 'Communication error with external service'}, status=503)
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
                "message": "A new tournament has been created"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({"success": True, "message": "Tournoi created successfully", "tournoi_id": tournois.id}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@verif_sessionID
@require_http_methods(["GET"])
def view(request):
    # Filtrer les tournois avec un statut égal à 0 et annoter chaque tournoi avec le nombre de joueurs
    tournois = Tournoi.objects.filter(status=0).annotate(nombre_joueurs=Count('players'))

    # Préparer les données pour la réponse
    data = []

    for tournoi in tournois:
        profile_info = get_profile_info_cookie(tournoi.admin_id, request.COOKIES.get('sessionid')) if tournoi.admin_id else {}
        
        tournoi_data = {
            'id': tournoi.id,
            'name': tournoi.name,
            'status': tournoi.status,
            'max_players': tournoi.max_players,
            'start_datetime': tournoi.start_datetime,
            'nombre_joueurs': tournoi.nombre_joueurs,  # Inclure le nombre de joueurs ici
            'admin_username': profile_info.get('username'),
        }

        data.append(tournoi_data)

    # Retourner les données en JSON
    return JsonResponse(data, safe=False, status=200)



@verif_sessionID
@require_http_methods(["GET"])
def tournament_detail(request, tournament_id):
    try:
        # Essayez de récupérer le tournoi par son ID
        tournament = Tournoi.objects.get(pk=tournament_id)
        profile_info = get_profile_info_cookie(tournament.admin_id, request.COOKIES.get('sessionid')) if tournament.admin_id else {}
        logging.critical(profile_info)
        player_count = tournament.players.count()
        if player_count == tournament.max_players - 1:
            tournament_group_name = f"tournoi_{tournament_id}"
            # Envoi du message au groupe de canaux spécifique du tournoi
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                tournament_group_name,  # Nom du groupe modifié pour être unique par tournoi
                {
                    "type": "update_boutton",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                    "message": "don't show buttons"
                }
            )
        # Préparez les données à renvoyer si le tournoi est trouvé
        data = {
            'success': True,
            'data': {
                'id': tournament.id,
                'name': tournament.name,
                'maxPlayer': tournament.max_players,
                'admin_id': tournament.admin_id,
                'status': tournament.status,
                'admin_username': profile_info.get('username'),
                'nombreDeJoueur': player_count,
                # Ajoutez d'autres champs selon votre modèle
            }
        }
    except Tournoi.DoesNotExist:
        # Si le tournoi n'est pas trouvé, renvoyez success: false avec un message d'erreur
        data = {
            'success': False,
            'error': "Tournament not found."
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

    joueur, created = Joueur.objects.get_or_create(
        user_id=user_id,
        defaults={'username': username}
    )

    if created:
        joueur.tournament = tournament
        joueur.save()
        tournament_group_name = f"tournoi_{tournament_id}"

        # Envoi du message au groupe de canaux spécifique du tournoi
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            tournament_group_name,  # Nom du groupe modifié pour être unique par tournoi
            {
                "type": "add_player",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                "message": "A new player has been added to the tournament"
            }
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "A new tournament has been created"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({"success": True, 'message': 'Joueur created successfully', 'joueur_id': joueur.id})
    
    if joueur.tournament is None:
        joueur.tournament = tournament
        joueur.save()
        tournament_group_name = f"tournoi_{tournament_id}"

        # Envoi du message au groupe de canaux spécifique du tournoi
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            tournament_group_name,  # Nom du groupe modifié pour être unique par tournoi
            {
                "type": "add_player",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                "message": "A new player has been added to the tournament"
            }
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "A new tournament has been created"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({'success': True, 'message': 'Joueur updated with new tournament successfully', 'joueur_id': joueur.id})

    return JsonResponse({"success": False, 'message': 'Joueur already exists', 'joueur_id': joueur.id})

@verif_sessionID
@require_http_methods(["GET"])
def view_joueur(request, tournament_id):
    # Filtrer les joueurs liés au tournoi
    joueurs = Joueur.objects.filter(tournament=tournament_id)

    # Liste pour stocker les données de réponse
    data = []

    for joueur in joueurs:
        # Récupérer le profil utilisateur via la fonction get_profile_info_cookie
        profile_info = get_profile_info_cookie(joueur.user_id, request.COOKIES.get('sessionid'))

        # Assembler les données du joueur et les informations du profil
        joueur_data = {
            'user_id': joueur.user_id,
            'username': joueur.username,
            'avatar': profile_info.get('avatar'),  # Ajout de l'avatar ou d'autres infos
            'avatar42': profile_info.get('avatar42'),  # Ajout de l'avatar ou d'autres infos
        }

        data.append(joueur_data)

    # Retourner les données sous forme de réponse JSON
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
                "status": tournoi.status,
            }
            return JsonResponse(tournoi_info)
        else:
            return JsonResponse({'error': 'Joueur not found or not associated with a tournament'}, status=200)
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
            joueur.tournament = None
            joueur.save()
            # joueur.delete()

            # Construire le nom du groupe de canaux pour le tournoi spécifique
            tournament_group_name = f"tournoi_{tournament_id}"

            # Envoi du message au groupe de canaux spécifique du tournoi pour notifier la suppression du joueur
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                tournament_group_name,  # Utiliser le nom du groupe basé sur l'ID du tournoi
                {
                    "type": "add_player",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                    "message": "A player has been removed from the tournament"
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
                    "message": "A new tournament has been created"  # Message à envoyer aux clients
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
                "message": "A tournament has been deleted"
            }
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "A new tournament has been created"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({'success': True, 'message': 'Tournoi and all associated players have been deleted.'})
    except Tournoi.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Tournoi not found.'}, status=404)
    except Exception as e:
        # Pour capturer d'autres erreurs potentielles
        return JsonResponse({'success': False, 'message': 'An error occurred: {}'.format(str(e))}, status=500)


import random

@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def create_matches(request, tournament_id):
    with transaction.atomic():
        tournament = Tournoi.objects.select_for_update().get(id=tournament_id)
        
        if Match.objects.filter(tournament=tournament).exists():
            return JsonResponse({'success': True, "message": "Matches already created for this tournament"}, status=200)
    
        tournament = Tournoi.objects.filter(id=tournament_id, status=Tournoi.CREATED).first()
        if not tournament:
            return JsonResponse({"error": "The tournament is not in a valid state to create matches."}, status=400)

        players = list(Joueur.objects.filter(tournament=tournament_id))

        if len(players) % 2 != 0:
            return JsonResponse({"error": "Odd number of players, impossible to create even matches."}, status=400)

        random.shuffle(players)
        matches_created = []
        
        number_of_matches = len(players) // 2
        match_id = 1  # Réinitialiser match_id à 1 pour le premier tour
        for i in range(0, len(players), 2):

            player_1 = players[i]
            player_2 = players[i+1]

            # Vérifiez que les deux joueurs existent
            if not (Joueur.objects.filter(user_id=player_1.id).exists() and Joueur.objects.filter(user_id=player_2.id).exists()):
                return JsonResponse({"error": f"One of the players does not exist : {player_1.id} ou {player_2.id}"}, status=400)


            # Créez un nouveau jeu via le service externe
            response = requests.post("https://game:8009/games", json={
                "player_left_id": player_1.user_id,
                "player_right_id": player_2.user_id,
            }, cookies=request.COOKIES, verify=False)

            if response.status_code != 201:
                return JsonResponse({"error": "Failed to create game in external service."}, status=response.status_code)

            game_data = response.json()
            game_id = game_data.get("id")

            # Créez le match en local
            match = Match.objects.create(
                player_1=player_1,
                player_2=player_2,
                tournament=tournament,
                tour=1,
                status=Match.NOT_PLAYED,
                match_id=match_id,
                game_id=game_id  # Assurez-vous que `game_id` est une colonne dans votre modèle Match
            )
            matches_created.append(match)
            match_id += 1

        current_tour = 2
        while number_of_matches > 1:
            match_id = 1  # Réinitialiser match_id à 1 pour chaque nouveau tour
            for _ in range(number_of_matches // 2):
                match = Match.objects.create(
                    tournament=tournament,
                    tour=current_tour,
                    status=Match.NOT_PLAYED,
                    match_id=match_id
                )
                matches_created.append(match)
                match_id += 1  # Incrémenter match_id pour le prochain match
            number_of_matches //= 2
            current_tour += 1

        tournament.status = Tournoi.IN_PROGRESS
        tournament.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "tournois",  # Nom du groupe WebSocket à informer (peut être n'importe quoi)
            {
                "type": "tournoi_cree",  # Type de message
                "message": "A new tournament has been created"  # Message à envoyer aux clients
            }
        )
        return JsonResponse({'success': True, "message": f"Matches were successfully created for all rounds. Number of matches created: {len(matches_created)}."}, status=201)


@verif_sessionID
@require_http_methods(["GET"])
def get_matches(request, tournament_id):
    try:
        # Vérifier l'existence du tournoi
        tournament = Tournoi.objects.get(id=tournament_id)
        matches = Match.objects.filter(tournament=tournament).order_by('tour', 'id')

        # Préparer les données des matchs groupées par tour
        tours_data = defaultdict(list)
        for match in matches:
            profile_info1 = get_profile_info_cookie(match.player_1.user_id, request.COOKIES.get('sessionid')) if match.player_1 else {}
            profile_info2 = get_profile_info_cookie(match.player_2.user_id, request.COOKIES.get('sessionid')) if match.player_2 else {}

            match_data = {
                "match_id": match.id,
                "player_1_id": match.player_1.user_id if match.player_1 else None,
                "player_1_username": match.player_1.username if match.player_1 else None,
                "player_1_score": match.player_1_score,
                "player_1_avatar": profile_info1.get('avatar'),
                "player_2_id": match.player_2.user_id if match.player_2 else None,
                "player_2_username": match.player_2.username if match.player_2 else None,
                "player_2_score": match.player_2_score,
                "player_2_avatar": profile_info2.get('avatar'),
                "status": match.status,
                "player_1_ready": match.player_1.status_ready if match.player_1 else False,
                "player_2_ready": match.player_2.status_ready if match.player_2 else False,
                "winner_id": match.winner.username if match.winner else None,
            }
            tours_data[match.tour].append(match_data)

        # Convertir le dictionnaire en liste de listes pour respecter le format souhaité
        sorted_tours = sorted(tours_data.items())
        matches_by_tour = [tour_matches for _, tour_matches in sorted_tours]

        return JsonResponse({'success': True, 'matches_by_tour': matches_by_tour}, safe=False)

    except Tournoi.DoesNotExist:
        return JsonResponse({'error': "Tournament not found."}, status=404)


@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def set_player_ready(request, player_id, match_id):
    try:
        player = Joueur.objects.get(user_id=player_id)

        # Bascule l'état de préparation du joueur
        if player.status_ready == Joueur.READY:
            player.status_ready = Joueur.NOT_READY
        else:
            player.status_ready = Joueur.READY
        player.save()

        # Récupérez le match correspondant au joueur
        match = Match.objects.get(id=match_id)
        if not match:
            return JsonResponse({"success": False, "error": "Matching match not found."}, status=404)

        # Vérifiez si les deux joueurs sont prêts
        tournament_group_name = f"tournoi_{match.tournament.id}"
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            tournament_group_name,  # Utiliser le nom du groupe basé sur l'ID du tournoi
            {
                "type": "player_ready",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                "message": "A player is ready"
            }
        )
        if match.player_1.status_ready == Joueur.READY and match.player_2.status_ready == Joueur.READY:
            match.status = Match.IN_PROGRESS
            match.save()
            return JsonResponse({"success": True, "match_started": True, "game_id": match.game_id})
        
        return JsonResponse({"success": True, "match_started": False, "player_status": player.status_ready, "game_id": match.game_id})

    except Joueur.DoesNotExist:
        return JsonResponse({"success": False, "error": "Player not found."}, status=404)



def get_profile_info_cookie(user_id, cookies):
    profile_service_url = f"https://profile:8002/get_user_profile/{user_id}/"
    try:
        response = requests.get(profile_service_url, cookies={'sessionid': cookies}, verify=False)
        if response.status_code == 200:
            return response.json()
        else:
            return {}
    except requests.exceptions.RequestException:
        return {}


@verif_sessionID
@require_http_methods(["GET"])
def get_latest_match_for_user(request, user_id, tournament_id):
    try:
        joueur = Joueur.objects.get(user_id=user_id)
        # Obtenir les matchs où le joueur est soit player_1 soit player_2, et qui ne sont pas encore terminés.
        latest_match = Match.objects.filter(
            (Q(player_1=joueur) | Q(player_2=joueur)),
            tournament_id=tournament_id,
            # status=Match.NOT_PLAYED
        ).order_by('-tour').first()  # Trier par 'tour' en ordre décroissant et prendre le premier

        if latest_match:
            match_data = {
                "match_id": latest_match.id,
                "player_1_id": latest_match.player_1.user_id if latest_match.player_1 else None,
                "player_1_username": latest_match.player_1.username if latest_match.player_1 else None,
                "player_2_id": latest_match.player_2.user_id if latest_match.player_2 else None,
                "player_2_username": latest_match.player_2.username if latest_match.player_2 else None,
                "status": latest_match.status,
                "tour": latest_match.tour,
                "leave": latest_match.leave,
                "player1ready" : latest_match.player_1.status_ready if latest_match.player_1 else None,
                "player2ready" : latest_match.player_2.status_ready if latest_match.player_2 else None,
                "game_id": latest_match.game_id,
                # Ajoutez ici d'autres données que vous souhaitez retourner.
            }
            return JsonResponse({'success': True, 'matches_data': match_data}, status=200)
        else:
            return JsonResponse({"error": "No current matches found for user."}, status=404)
    
    except Joueur.DoesNotExist:
        return JsonResponse({'error': "User not found."}, status=404)


@csrf_exempt
@verif_sessionID
@require_http_methods(["POST"])
def update_winner_and_prepare_next_match(request, match_id, winner_id, score1, score2):
    try:
        match = Match.objects.get(id=match_id)
        winner = Joueur.objects.get(user_id=winner_id)
        winner.status_ready = 0
        match.winner = winner
        match.status = Match.FINISHED
        match.player_1_score = score1
        match.player_2_score = score2
        match.save()
        winner.save()
    except ObjectDoesNotExist:
        return JsonResponse({'error': "Match or Player not found."}, status=404)

    next_tour = match.tour + 1
    tournament = match.tournament

    try:
        # Logique pour déterminer l'indice pour le prochain match (cette partie doit être révisée selon le besoin exact)
        n_float = float(match.match_id / 2)
        modulo_result = n_float % 1
        if modulo_result == 0.5:
            n_float += 0.5
        match_index = int(n_float)
        logging.critical(match_index)

        match_next_tour = Match.objects.filter(tour=next_tour).order_by('id').first()
        if match_next_tour is None:
            tournament.status = Tournoi.FINISHED
            tournament.save()
            tournament_group_name = f"tournoi_{match.tournament.id}"
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                tournament_group_name,  # Utiliser le nom du groupe basé sur l'ID du tournoi
                {
                    "type": "winner",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
                    "message": "One player wins"
                }
            )
            return JsonResponse({'success': True, 'message': "Final."}, status=200)
        # Trouver le prochain match basé sur l'index calculé si nécessaire
        # Cette logique doit être ajustée selon la structure exacte et la logique de votre application
        next_match = Match.objects.filter(tournament=tournament, tour=next_tour).order_by('match_id')[match_index - 1]

        if next_match:
            # if next_match.player_1 is None:
            if match.match_id % 2 == 1:
                next_match.player_1 = winner
            elif match.match_id % 2 == 0:
                next_match.player_2 = winner

            # Vérifiez que les deux joueurs existent avant de créer un jeu
            if next_match.player_1 and next_match.player_2:
                # Vérifiez que le `game_id` est nul avant de créer le jeu
                if next_match.game_id is None:
                    response = requests.post("https://game:8009/games", json={
                        "player_left_id": next_match.player_1.user_id,
                        "player_right_id": next_match.player_2.user_id,
                    }, cookies=request.COOKIES, verify=False)

                    if response.status_code != 201:
                        return JsonResponse({"error": "Failed to create game in external service."}, status=response.status_code)

                    game_data = response.json()
                    next_match.game_id = game_data.get("id")
            
            next_match.save()
        else:
            return JsonResponse({'message': "No matches available for update."}, status=404)

    except IndexError:
        return JsonResponse({'error': "Index out of reach."}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    tournament_group_name = f"tournoi_{match.tournament.id}"
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        tournament_group_name,  # Utiliser le nom du groupe basé sur l'ID du tournoi
        {
            "type": "winner",  # Assurez-vous que cela correspond à la fonction dans votre consommateur
            "message": "One player wins"
        }
    )
    return JsonResponse({
        'success': True,
        'message': "The winner has been updated and the next match has been prepared."
    }, status=200)


@csrf_exempt  # Exempter de CSRF pour simplifier l'exemple
@verif_sessionID
@require_http_methods(["POST"])  # S'assurer que la requête est de type POST
def delete_player_and_tournament_if_empty(request, player_id):
    try:
        # Trouver le joueur spécifié par ID
        player = Joueur.objects.get(user_id=player_id)
        tournament = player.tournament  # Récupérer le tournoi associé au joueur

        # Supprimer le joueur
        player.tournament = None
        player.status_ready = Joueur.NOT_READY
        player.save()
        message = "Player deleted."

        return JsonResponse({'success': True, 'message': message}, status=200)
    except Joueur.DoesNotExist:
        return JsonResponse({'error': "Player not found."}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
        
@csrf_exempt  # Exempter de CSRF pour simplifier l'exemple
@verif_sessionID
@require_http_methods(["POST"])  # S'assurer que la requête est de type POST
def update_leave(request, match_id, player):
    try:
        match = Match.objects.get(id=match_id)
        match.leave = player
        match.save()
        return JsonResponse({'success': True, 'message': "match update leave player"}, status=200)
    except ObjectDoesNotExist:
        return JsonResponse({'error': "Match or Player not found."}, status=404)