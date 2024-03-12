import { redirectTo } from '@/router.js';

const API_BASE_URL = 'http://127.0.0.1:8001';

const user = {
  isAuthenticated: undefined,
  id: null,
  username: null,
  email: null,
  victories: 0,
  lost: 0,
  online: 0,
  local: 0,
  timeplay: 0,
  nbtotal: 0,
  friends: 0,
  avatar: null,
  first_name: null,
  last_name: null,
};

const setLocalUser = data => {
  localStorage.setItem('isLogged', 'true');
  user.isAuthenticated = true;
  user.id = data.id;
  user.email = data.email;
  user.username = data.username;

  user.victories = 183;
  user.lost = 13;
  user.online = 160;
  user.local = 27;
  user.timeplay = 130;
  user.nbtotal = 1;
  user.friends = 0;
};

const resetLocalUser = () => {
  // localStorage.setItem('isLogged', 'false');
  user.isAuthenticated = false;
  user.id = null;
  user.email = null;
  user.username = null;
  user.victories = 0;
  user.lost = 0;
  user.online = 0;
  user.local = 0;
  user.timeplay = 0;
  user.nbtotal = 0;
  user.friends = 0;
  user.avatar = null;
  user.first_name = null;
  user.last_name = null;
};

const isAuthenticated = async () => {
  try {
    if (user.isAuthenticated === undefined) {
      resetLocalUser();
      const response = await fetch(`${API_BASE_URL}/accounts/is_user_logged_in/`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setLocalUser(data);
      } else {
        resetLocalUser();
      }
    }
  } catch (error) {
    console.error('Error:', error);
    resetLocalUser();
  }
  return user.isAuthenticated;
};

const getCsrfToken = async () => {
  const response = await fetch('http://127.0.0.1:8001/accounts/get-csrf-token/', {
    method: 'GET',
    credentials: 'include',
  });
  if (response.ok) {
    const data = await response.json();
    console.log(data.csrfToken);
    return data.csrfToken;
  }
  throw new Error('Could not retrieve CSRF token');
}

const logout = async () => {
  try {
    const csrfToken = await getCsrfToken();
    await fetch(`${API_BASE_URL}/accounts/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
      },
    });
  } catch (error) {
    console.error('Error:', error);
  }

  resetLocalUser();
};


const getProfile = () => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstname: user.first_name ?? "",
    lastname: user.last_name ?? "",
    avatar: user.avatar ?? `https://i.pravatar.cc/300?u=6${user.id}`,
  };
};

const loginUser = async (formData, csrfToken) => {
  const response = await fetch('http://127.0.0.1:8001/accounts/login/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
  });
  return response.json(); // Retourne la promesse résolue avec les données JSON
}

const sendSignUpRequest = async (formData, csrfToken) => {
  const response = await fetch('http://127.0.0.1:8001/accounts/register/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
  });
  return response.json(); // Retourne la promesse résolue avec les données JSON
}

const passwordReset = async (formData, csrfToken) => {
  const response = await fetch('http://127.0.0.1:8001/accounts/password_reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
  return response.json();
}

const sendEmailPasswordReset = async (formData, csrfToken, url) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  });
  return response.json();
}

const handleOAuthResponse = async () => {
  if (window.location.search.includes("code=")) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      console.log(code);
      const csrfToken = await getCsrfToken();
      // Envoyer le code d'autorisation au serveur pour obtenir un token d'accès
      fetch('http://127.0.0.1:8001/accounts/oauth/callback/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({ code: code })
      })
      .then(response => response.json())
      .then(data => {
          console.log(data); // Traiter la réponse
          if (data.access_token) {
              localStorage.setItem('isLogged', 'true');
              user.isAuthenticated = true;
              user.id = data.id;
              user.email = data.email;
              user.username = data.username;
              user.avatar = data.avatar.link;
              user.first_name = data.first_name;
              user.last_name = data.last_name;
              console.log(user.avatar);
              console.log(data.register);
              redirectTo('/dashboard');
          }
      })
      .catch(error => console.error('Erreur:', error));
  }
}

const getAuthorizationCode = () => {
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-032700fdff8bf6b743669184234c5670698f0f0ef95b498514fc13b5e7af32f0&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Floading&response_type=code`;
  window.location.href = url;
}  

export { user, isAuthenticated, logout, getProfile, getCsrfToken, loginUser, sendSignUpRequest, passwordReset, sendEmailPasswordReset, handleOAuthResponse, getAuthorizationCode };
