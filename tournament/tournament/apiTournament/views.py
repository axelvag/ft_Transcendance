from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import json
from .models import Joueur, Tournoi
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

# @login_required
@csrf_exempt
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
        
        return JsonResponse({"success": True, "message": "Tournoi created successfully", "tournoi_id": tournois.id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def view(request):
    # Filtrez les tournois avec un status égal à 0
    tournois = Tournoi.objects.filter(status=0)

    # Préparez les données pour la réponse
    # Note : Adaptez les champs 'name', 'max_players', etc., selon votre modèle
    data = list(tournois.values('id', 'name', 'status', 'max_players', 'start_datetime'))

    # Retournez les données en JSON
    return JsonResponse(data, safe=False)


@csrf_exempt
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
@require_http_methods(["POST"])
def create_joueur(request):
    # data = request.POST 
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

    joueur = Joueur(username=username, user_id=user_id, tournament=tournament)
    joueur.save()

    return JsonResponse({"success": True, 'message': 'Joueur created successfully', 'joueur_id': joueur.id})


@csrf_exempt
def view_joueur(request, tournament_id):
    # Filtrez les tournois avec un status égal à 0
    joueur = Joueur.objects.filter(tournament=tournament_id)

    # Préparez les données pour la réponse
    # Note : Adaptez les champs 'name', 'max_players', etc., selon votre modèle
    data = list(joueur.values('user_id', 'username'))

    # Retournez les données en JSON
    return JsonResponse(data, safe=False)

# @csrf_exempt
# def joueur_in_tournament(request, user_id):
#     # Filtrez les tournois avec un status égal à 0
#     joueur = Joueur.objects.filter(user_id=user_id)
#     if joueur is None:
#         return JsonResponse({'error': 'Joueur not found'}, status=404)
#     tournament_id = joueur.tournament.id
#     return JsonResponse({"success": True, 'message': 'Joueur found', 'tournament_name': tournament_id})
    
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_joueur(request, user_id):
    # Filtrez les tournois avec un status égal à 0
    joueur = Joueur.objects.filter(user_id=user_id)
    joueur.delete()

    return JsonResponse({"success": True, 'message': 'Joueur delete successfully'})

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_tournoi(request, tournoi_id):
    try:
        # Trouver le tournoi par son ID
        tournoi = Tournoi.objects.get(pk=tournoi_id)
        # Supprimer le tournoi. Tous les joueurs liés seront également supprimés grâce à on_delete=models.CASCADE
        tournoi.delete()
        return JsonResponse({'success': True, 'message': 'Tournoi and all associated players have been deleted.'})
    except Tournoi.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Tournoi not found.'}, status=404)
    except Exception as e:
        # Pour capturer d'autres erreurs potentielles
        return JsonResponse({'success': False, 'message': 'An error occurred: {}'.format(str(e))}, status=500)
