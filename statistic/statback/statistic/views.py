from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Statistic
from django.contrib.auth import get_user_model
import logging
import requests

User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def update_stat(request):
  logging.critical("Received request")
  logging.debug("START")
  if request.content_type.startswith('multipart/form-data'): # grace au formData envoyer
      # Extraction des données depuis une requête multipart/form-data
      user_id = request.POST.get('id')
      victories = request.POST.get('victories')
      lost = request.POST.get('lost')
      online = request.POST.get('online')
      local = request.POST.get('local')
      timeplay = request.POST.get('timeplay')
      nbtotal = request.POST.get('nbtotal')
      friends = request.POST.get('friends')
  else:
      # Tentative d'extraction des données JSON
      try:
          data = json.loads(request.body.decode('utf-8'))
          user_id = data.get('id')
          victories = data.get('victories')
          lost = data.get('lost')
          online = data.get('online')
          local = data.get('local')
          timeplay = data.get('timeplay')
          nbtotal = data.get('nbtotal')
          friends = data.get('friends')
      except json.JSONDecodeError:
          return JsonResponse({"success": False, "message": "Invalid or missing JSON data."}, status=400)

  # Mettre à jour les statistiques de l'utilisateur
  try:
      stat, created = Statistic.objects.update_or_create(
          user_id=user_id,
          defaults={
              'victories': victories,
              'lost': lost,
              'online': online,
              'local': local,
              'timeplay': timeplay,
              'nbtotal': nbtotal,
              'friends': friends
          }
      )
  except Exception as e:
      logging.error(f"Error updating user statistics: {e}")
      return JsonResponse({"success": False, "message": "Error updating user statistics."})

  # Réponse de succès
  response = JsonResponse({
      "success": True,
      "message": "User statistics updated successfully.",
      "id": user_id,
      "victories": victories,
      "lost": lost,
      "online": online,
      "local": local,
      "timeplay": timeplay,
      "nbtotal": nbtotal,
      "friends": friends
  })

   # Ajouter les en-têtes CORS
    response["Access-Control-Allow-Origin"] = "*"  # Ou vous pouvez spécifier les origines autorisées
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"  # Méthodes HTTP autorisées
    response["Access-Control-Allow-Headers"] = "Content-Type"  # En-têtes autorisés

    return response