import { redirectTo } from '@/router.js';

const user = {
  isAuthenticated: false,
  id: null,
  username: null,
  email: null,
};

const isAuthenticated = () => {
  if(user.isAuthenticated === true)
    return true;
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
        user.isAuthenticated = true;
        user.id = data.id;
        user.email = data.email;
        user.username = data.username;
        displayDashboardCallback(data.username);
      } else {
        redirectTo('/login');
      }
    })
    .catch(error => console.error(error));
};

const verifyUserLoginMain = () => {
  return fetch(`${API_BASE_URL}/accounts/is_user_logged_in/`, {
    method: 'GET',
    credentials: 'include', // Pour inclure les cookies dans la requête
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        user.isAuthenticated = true;
        user.id = data.id;
        user.email = data.email;
        user.username = data.username;
        redirectTo('/dashboard'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      }
    })
    .catch(error => {
      console.error("Erreur lors de la vérification de l'état de connexion:", error);
      throw error; // Renvoyer l'erreur pour la gestion côté appelant
    });
};


export { user, isAuthenticated, isUserLoggedIn, verifyUserLoginAndDisplayDashboard , verifyUserLoginMain };
