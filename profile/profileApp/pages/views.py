from django.shortcuts import render
from .models import Profile

# Create your views here.
@csrf_exempt
@require_http_methods(["POST"])  # Accepte uniquement les requêtes POST
def update_user(request):
    try:
        # Assurez-vous que le corps de la requête est au format JSON
        data = json.loads(request.body)

        username = data.get('username')
        email = data.get('email')
        user_id = data.get('id')  # Identifiant de l'utilisateur à mettre à jour
        
        first_name = data.get('firstName')
        last_name = data.get('lastName')

        # Recherche de l'utilisateur par son ID
        user = User.objects.get(pk=user_id)

        try:
          profile = Porfile.objects.get(pk=user_id)
        except Profile.DoesNotExist:
          profile = Profile.objects.create(firstName=first_name, lastName=last_name, user_id_tableUser=user_id)
          # return JsonResponse({'error': 'User not found'}, status=404)
        
        # Mise à jour de l'utilisateur
        if username:
            user.username = username
        if email:
            user.email = email
        if first_name:
            Profile.first_name = first_name
        if last_name:
            Profile.last_name = last_name
        if user_id:
            Porfile.user_id_tableUser = user_id

        user.save()
        Profile.save()

        return JsonResponse({"success": True, "message": "Utilisateur mis à jour avec succès."})
    except ObjectDoesNotExist:
        return JsonResponse({"success": False, "message": "Utilisateur non trouvé."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)