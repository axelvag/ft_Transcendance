# from django.test import TestCase
# from django.contrib.auth.models import User
# from .models import Invitation
# from django.urls import reverse
# from .forms import InvitationForm


# class InvitationModelTests(TestCase):
#     def setUp(self):
#         # Créer deux utilisateurs pour tester les invitations
#         self.user1 = User.objects.create_user(username='user1', password='testpass123')
#         self.user2 = User.objects.create_user(username='user2', password='testpass123')

#     def test_invitation_creation(self):
#         # Tester la création d'une invitation
#         invitation = Invitation.objects.create(
#             from_user=self.user1,
#             to_user=self.user2,
#             accepted=False
#         )
#         self.assertEqual(invitation.from_user, self.user1)
#         self.assertEqual(invitation.to_user, self.user2)
#         self.assertFalse(invitation.accepted)

# class InvitationFormTests(TestCase):
#     def setUp(self):
#         self.user1 = User.objects.create_user(username='user1', password='testpass123')
#         self.user2 = User.objects.create_user(username='user2', password='testpass123')

#     def test_form_with_existing_username(self):
#         # Tester le formulaire avec un nom d'utilisateur existant
#         form_data = {'username': 'user2'}
#         form = InvitationForm(data=form_data)
#         self.assertTrue(form.is_valid())

#     def test_form_with_non_existing_username(self):
#         # Tester le formulaire avec un nom d'utilisateur qui n'existe pas
#         form_data = {'username': 'nonexistinguser'}
#         form = InvitationForm(data=form_data)
#         self.assertFalse(form.is_valid())

# from django.test import TestCase
# from django.contrib.auth.models import User
# from django.urls import reverse
# from .models import Invitation
# from .forms import InvitationForm
# from django.http import JsonResponse


# class InvitationViewTests(TestCase):
#     def setUp(self):
#         # Créer deux utilisateurs pour tester les invitations
#         self.user1 = User.objects.create_user(username='user1', password='testpass123')
#         self.user2 = User.objects.create_user(username='user2', password='testpass123')
#         # Vous devez vous connecter avant de pouvoir envoyer une invitation
#         self.client.login(username='user1', password='testpass123')

#     def test_home_view_get(self):
#         # Tester que la page home est accessible via GET et retourne un statut 200
#         response = self.client.get(reverse('home'))
#         self.assertEqual(response.status_code, 200)

#     def test_home_view_post_valid(self):
#         # Tester l'envoi d'une invitation valide via POST et vérifier que cela retourne un statut 200
#         response = self.client.post(reverse('home'), {'username': 'user2'})
#         self.assertEqual(response.status_code, 200)

#     def test_home_view_post_invalid(self):
#         # Tester l'envoi d'une invitation non valide via POST et vérifier que cela ne retourne pas un statut 200
#         response = self.client.post(reverse('home'), {'username': 'nonexistinguser'})
#         self.assertNotEqual(response.status_code, 200)

# Vous devriez également avoir une URL nommée 'home' dans votre fichier urls.py pour que reverse('home') fonctionne.

from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Invitation
from django.utils import timezone

class InvitationModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='testpass123')
        self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='testpass123')

    def test_invitation_creation(self):
        time_before_creation = timezone.now()
        invitation = Invitation.objects.create(
            from_user=self.user1,
            to_user=self.user2,
            accepted=False,
            sent_at=timezone.now()
        )
        self.assertEqual(invitation.from_user, self.user1)
        self.assertEqual(invitation.to_user, self.user2)
        self.assertFalse(invitation.accepted)
        self.assertTrue(time_before_creation <= invitation.sent_at <= timezone.now())

class InvitationViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='testpass123')
        self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='testpass123')
        self.client.login(username='user1', password='testpass123')

    def test_home_view_post_valid(self):
        # Assurez-vous d'envoyer les bonnes données attendues par le formulaire.
        response = self.client.post(reverse('home'), {'username': self.user2.username})  # Ajustez en fonction du formulaire
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Invitation.objects.filter(from_user=self.user1, to_user=self.user2).exists())


    def test_home_view_post_invalid(self):
        response = self.client.post(reverse('home'), {
            # Données invalides pour tester la gestion des erreurs
        })
        self.assertEqual(response.status_code, 400)
        

    def test_home_view_get(self):
        Invitation.objects.create(from_user=self.user1, to_user=self.user2, accepted=False)
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('invitations', response.json())  # Vérifiez que la réponse contient les données des invitations
