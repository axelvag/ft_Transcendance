const API_BASE_URL = 'http://127.0.0.1:8001';

const user = {
  isAuthenticated: false,
  id: null,
  username: null,
  email: null,
};

const isAuthenticated = async () => {
  try {
    if (!user.isAuthenticated) {
      const reponse = await fetch(`${API_BASE_URL}/accounts/is_user_logged_in/`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await reponse.json();
      if (!data.success) {
        user.isAuthenticated = true;
        user.id = data.id;
        user.email = data.email;
        user.username = data.username;
      }
    }
    return user.isAuthenticated;
  } catch (error) {
    return false;
  }
};

const getCSRFToken = () => {
  const csrfTokenCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  if (csrfTokenCookie) {
    console.log('csrf find');
    return csrfTokenCookie.split('=')[1];
  }
  console.log('csrf not find');
  return null; // Retourne null si le cookie CSRF n'est pas trouvé
};

export { user, isAuthenticated, getCSRFToken };
