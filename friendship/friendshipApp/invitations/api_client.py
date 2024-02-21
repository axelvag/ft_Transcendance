import requests

class AuthAPIClient:
    BASE_URL = 'http://authentification:8001/accounts'

    # BASE_URL = 'http://127.0.0.1:8001/accounts/'  # Changez cela par l'URL réelle de votre service d'authentification

    # @staticmethod
    def get_user_status(username):
        print("hello World")
        response = requests.get(f"{AuthAPIClient.BASE_URL}/is_user_logged_in", params={'username': username})
        if response.status_code == 200:
            return response.json()
        else:
            # Gérer les erreurs ou les statuts de réponse non attendus ici
            response.raise_for_status()
