from django.test import TestCase
from django.contrib.auth.models import User
from .models import Invitation
from django.urls import reverse
from .forms import InvitationForm


class InvitationModelTests(TestCase):
    def setUp(self):
        # Créer deux utilisateurs pour tester les invitations
        self.user1 = User.objects.create_user(username='user1', password='testpass123')
        self.user2 = User.objects.create_user(username='user2', password='testpass123')

    def test_invitation_creation(self):
        # Tester la création d'une invitation
        invitation = Invitation.objects.create(
            from_user=self.user1,
            to_user=self.user2,
            accepted=False
        )
        self.assertEqual(invitation.from_user, self.user1)
        self.assertEqual(invitation.to_user, self.user2)
        self.assertFalse(invitation.accepted)

class InvitationFormTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='testpass123')
        self.user2 = User.objects.create_user(username='user2', password='testpass123')

    def test_form_with_existing_username(self):
        # Tester le formulaire avec un nom d'utilisateur existant
        form_data = {'username': 'user2'}
        form = InvitationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_form_with_non_existing_username(self):
        # Tester le formulaire avec un nom d'utilisateur qui n'existe pas
        form_data = {'username': 'nonexistinguser'}
        form = InvitationForm(data=form_data)
        self.assertFalse(form.is_valid())

