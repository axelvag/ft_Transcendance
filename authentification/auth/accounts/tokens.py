from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import base36_to_int
import datetime
from django.utils.crypto import constant_time_compare
from django.conf import settings

# import six  

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    # def _make_hash_value(self, user, timestamp):
    #     return f"{user.pk}{timestamp}{user.is_active}"

    def _make_hash_value(self, user, timestamp):
        now_timestamp = datetime.datetime.now().timestamp()
        return f"{user.pk}{now_timestamp}{user.is_active}"

    def check_token(self, user, token):
        # Vérification du token
        try:
            ts_b36, _ = token.split("-")
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Calculer la durée depuis la création du token
        if (datetime.datetime.now() - datetime.datetime.fromtimestamp(ts)).total_seconds() > 978307800:
            return False

        return True
        # return super().check_token(user, token)

account_activation_token = AccountActivationTokenGenerator()