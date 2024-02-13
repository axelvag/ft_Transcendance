// apiService.js
const API_BASE_URL = 'http://127.0.0.1:8001';

export const isUserLoggedIn = () => {
  return fetch(`${API_BASE_URL}/accounts/is_user_logged_in/`, {
    method: 'GET',
    credentials: 'include', // Pour inclure les cookies dans la requête
  })
  .then(response => response.json())
  .catch(error => {
    console.error('Erreur lors de la vérification de l\'état de connexion:', error);
    throw error; // Renvoyer l'erreur pour la gestion côté appelant
  });
}