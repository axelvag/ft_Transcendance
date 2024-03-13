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

  // user.victories = 183;
  // user.lost = 13;
  // user.online = 160;
  // user.local = 27;
  // user.timeplay = 130;
  // user.nbtotal = 1;
  // user.friends = 0;
};

const setStat = data => {
  localStorage.setItem('isLogged', 'true');
  user.isAuthenticated = true;
  user.id = data.id;
  user.victories = data.victories;
  user.lost = data.lost;
  user.online = data.online;
  user.local = data.local;
  user.timeplay = data.timeplay;
  user.nbtotal = data.nbtotal;
  user.friends = data.friends;
}

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
        console.log('OUIIII');
        const responseStat = await fetch(`http://127.0.0.1:8004/statistic/update_stat/`, {
          method: 'GET',
          credentials: 'include',
        });
        console.log('ICI');
        const dataStat = await responseStat.json();
        if (dataStat.success) {
          setStat(dataStat);
        }
      }
      else {
        console.log('NONNNN');
        resetLocalUser();
      }
    }
  } catch (error) {
    console.error('Error:', error);
    resetLocalUser();
  }
  return user.isAuthenticated;
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

const logout = async () => {
  try {
    await fetch(`${API_BASE_URL}/accounts/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': getCSRFToken(),
      },
    });
  } catch (error) {
    console.error('Error:', error);
  }

  resetLocalUser();
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

export { user, isAuthenticated, getCSRFToken, logout, getProfile, getCsrfToken, loginUser, sendSignUpRequest, passwordReset, sendEmailPasswordReset };
