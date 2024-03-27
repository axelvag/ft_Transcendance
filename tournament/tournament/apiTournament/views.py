from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import json
from .models import Tournoi

@require_http_methods(["POST"])
def create_tournament(request):
    try:
        data = json.loads(request.body)
        name = data['name']
        max_players = data['max_players']

        start_datetime = timezone.now() + timedelta(minutes=10)

        tournoi = Tournoi(name=name, max_players=max_players, start_datetime=start_datetime)
        tournoi.save()
        
        return JsonResponse({"message": "Tournoi created successfully", "tournoi_id": tournoi.id}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
