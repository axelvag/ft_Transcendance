import { redirectTo } from '@/router.js';

const user = {
  isAuthenticated: false,
};

const isAuthenticated = userId => {
  //...
  return false;
};

const API_BASE_URL = 'http://127.0.0.1:8001';

const isUserLoggedIn = () => {
  return fetch(`${API_BASE_URL}/accounts/is_user_logged_in/`, {
    method: 'GET',
    credentials: 'include', // Pour inclure les cookies dans la requête
  })
    .then(response => response.json())
    .catch(error => {
      console.error("Erreur lors de la vérification de l'état de connexion:", error);
      throw error; // Renvoyer l'erreur pour la gestion côté appelant
    });
};

const verifyUserLoginAndDisplayDashboard = displayDashboardCallback => {
  isUserLoggedIn()
    .then(data => {
      if (data.success) {
        console.log(data.username, data.email);
        displayDashboardCallback(data.username);
      } else {
        redirectTo('/login');
      }
    })
    .catch(error => console.error(error));
};

export { user, isAuthenticated, isUserLoggedIn, verifyUserLoginAndDisplayDashboard };
