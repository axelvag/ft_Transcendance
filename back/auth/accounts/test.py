from django.urls import reverse
from django.test import TestCase, Client, RequestFactory
from . import views  # Assurez-vous que l'importation de vos vues est correcte
import json
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from accounts.tokens import account_activation_token
from django.contrib.auth import get_user_model
from unittest.mock import patch
from accounts.forms import UserCreationFormWithEmail
from django.core.exceptions import ValidationError
from django.core.mail import EmailMessage
from accounts.views import activateEmail 


# class ActivateTestCase(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(username='testuser', password='12345', email='test@example.com')
#         self.user.set_unusable_password()
#         self.user.save()

#     def test_activate_valid(self):
#         uid = urlsafe_base64_encode(force_bytes(self.user.pk))
#         token = account_activation_token.make_token(self.user)
#         url = reverse('accounts:activate', kwargs={'uidb64': uid, 'token': token})
#         response = self.client.get(url)
#         self.user.refresh_from_db()
#         self.assertTrue(self.user.is_active)
#         self.assertTrue(get_user_model().objects.get(pk=self.user.pk).is_active)
#         self.assertEqual(response.status_code, 200)

#     def test_activate_invalid(self):
#         url = reverse('accounts:activate', kwargs={'uidb64': 'invalid_uid', 'token': 'invalid_token'})
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, 400)

# class RegistrationTestCase(TestCase):
#     def test_register_user_valid_credentials_success(self):
#         client = Client()
#         url = reverse('accounts:register_user')
#         data = {
#             'username': 'registerUser',
#             'password1': 'Testpassword69',
#             'password2': 'Testpassword69',
#             'email': 'test@gmail.com'
#         }
#         response = client.post(url, data, format='json')  # Notez l'utilisation de 'format='json''
#         self.assertEqual(response.status_code, 200)

# class LoginUserTestCase(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(username='testuser', email='test@example.com', password='12345')
#         self.user.is_active = True
#         self.user.save()

#     def test_login_successful(self):
#         data = {
#             'username': 'testuser',
#             'password': '12345'
#         }
#         response = self.client.post(reverse('accounts:login_user'), data)
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, encoding='utf8'), {"success": True, "message": "Login successful."})

#     def test_login_failed(self):
#         data = {
#             'username': 'wronguser',
#             'password': 'wrongpassword'
#         }
#         response = self.client.post(reverse('accounts:login_user'), data)
#         self.assertEqual(response.status_code, 400)

# class LogoutUserTestCase(TestCase):
#     def setUp(self):
#         # Créer un utilisateur de test et le connecter
#         self.user = User.objects.create_user(username='testuser', email='test@example.com', password='12345')
#         self.client.login(username='testuser', password='12345')

#     def test_logout_successful(self):
#         # Effectuer une demande de déconnexion
#         response = self.client.get(reverse('accounts:logout_user'))

#         # Vérifier que l'utilisateur est déconnecté
#         self.assertNotIn('_auth_user_id', self.client.session)

#         # Vérifier que la réponse est correcte
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, encoding='utf8'), {"success": True, "message": "You have been logged out successfully."})

# class UserCreationFormWithEmailTestCase(TestCase):
#     def test_clean_email_unique(self):
#         # Créer un utilisateur de test avec un email existant
#         existing_user = User.objects.create_user(username='existinguser', email='test@example.com', password='12345')

#         # Créer une instance du formulaire avec le même email
#         form = UserCreationFormWithEmail(data={'username': 'newuser', 'email': 'test@example.com', 'password1': 'Transcendence123', 'password2': 'Transcendence123'})

#         # Vérifier que la validation échoue avec un message d'erreur
#         self.assertFalse(form.is_valid())
#         self.assertIn('email', form.errors)
#         self.assertEqual(form.errors['email'][0], 'Un utilisateur avec cet email existe déjà.')

#     def test_clean_email_unique_pass(self):
#         # Créer une instance du formulaire avec un email non existant
#         form = UserCreationFormWithEmail(data={'username': 'newuser', 'email': 'test@example.com', 'password1': 'Transcendence123', 'password2': 'Transcendence123'})

#         # Vérifier que la validation réussit
#         self.assertTrue(form.is_valid())

#     def test_save_user(self):
#         # Créer une instance du formulaire avec des données valides
#         form = UserCreationFormWithEmail(data={'username': 'newuser', 'email': 'test@example.com', 'password1': 'Transcendence123', 'password2': 'Transcendence123'})

#         # Vérifier que le formulaire est valide
#         self.assertTrue(form.is_valid())

#         # Appeler la méthode save pour créer un utilisateur
#         user = form.save()

#         # Vérifier que l'utilisateur a été créé avec les données fournies
#         self.assertEqual(user.username, 'newuser')
#         self.assertEqual(user.email, 'test@example.com')

#     def test_save_user_commit_false(self):
#         # Créer une instance du formulaire avec des données valides
#         form = UserCreationFormWithEmail(data={'username': 'newuser', 'email': 'test@example.com', 'password1': 'Transcendence123', 'password2': 'Transcendence123'})

#         # Vérifier que le formulaire est valide
#         self.assertTrue(form.is_valid())

#         # Appeler la méthode save avec commit=False pour créer un utilisateur sans enregistrement immédiat
#         user = form.save(commit=False)

#         # Vérifier que l'utilisateur n'a pas encore été enregistré
#         self.assertFalse(User.objects.filter(username='newuser').exists())

#         # Enregistrer l'utilisateur manuellement
#         user.save()

#         # Vérifier que l'utilisateur a été enregistré avec les données fournies
#         self.assertEqual(user.username, 'newuser')
#         self.assertEqual(user.email, 'test@example.com')

# class RegisterUserTestCase(TestCase):
#     # def setUp(self):
#     #     self.user = User.objects.create_user(username='testuser', email='test@example.com', password='Transcendence123')

#     @patch('django.core.mail.EmailMessage.send')
#     def test_register_user_success(self, mock_send):
#         # Configurer le mock pour simuler un succès
#         mock_send.return_value = True

#         response = self.client.post(reverse('accounts:register_user'), {'username': 'testuser', 'email': 'test@example.com', 'password1': 'Transcendence123', 'password2': 'Transcendence123'})
#         self.assertEqual(response.status_code, 200)
#         self.assertJSONEqual(str(response.content, encoding='utf8'), {"success": True, "message": "Registration successful. Please check your email to activate your account."})

# class ActivateEmailTestCase(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(username='testuser', email='test@example.com', password='12345')
#         self.factory = RequestFactory()

#     @patch('django.core.mail.EmailMessage.send')
#     def test_activate_email_failure(self, mock_send):
#         # Configurer le mock pour simuler un échec
#         mock_send.return_value = False

#         # Créer un objet request simulé
#         request = self.factory.get('/dummy-url/')  # Vous pouvez ajuster l'URL en conséquence
#         request.user = self.user

#         response = activateEmail(request=request, user=self.user, to_email='recipient@example.com')
#         self.assertEqual(response.status_code, 500)
#         self.assertJSONEqual(str(response.content, encoding='utf8'), {"success": False, "message": f'Problem sending email to recipient@example.com, check if you typed it correctly.'})