from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import json
from .models import Tournoi
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

        start_datetime = timezone.now() + timedelta(minutes=10)

        tournois = Tournoi(name=name, max_players=max_players, start_datetime=start_datetime)
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
                # Ajoutez d'autres champs selon votre modèle
            }
        }
    except Tournament.DoesNotExist:
        # Si le tournoi n'est pas trouvé, renvoyez success: false avec un message d'erreur
        data = {
            'success': False,
            'error': "Tournoi non trouvé."
        }
    
    # Renvoie les données en format JSON
    return JsonResponse(data)
