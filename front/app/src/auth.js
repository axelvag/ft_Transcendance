// import profilePic from './assets/img/profile.jpg';
const API_BASE_URL = 'http://127.0.0.1:8001';

const user = {
  isAuthenticated: undefined,
  id: null,
  username: null,
  email: null,
  avatar: null,
  firstname: null,
  lastname: null,
  avatar: null,

  //stat
  victories: 0,
  lost: 0,
  online: 0,
  local: 0,
  timeplay: 0,
  nbtotal: 0,
  friends: 0,
};

const setLocalAvatar = avatar => {
  user.avatar = avatar || 'assets/img/default-profile.jpg';
};

const setLocalUser = data => {
  localStorage.setItem('isLogged', 'true');
  user.isAuthenticated = true;
  user.id = data.id || '';
  user.email = data.email || '';
  user.username = data.username || '';
  setLocalAvatar(data.avatar);
  user.firstname = data.firstname || '';
  user.lastname = data.lastname || '';
  user.id = data.id;
  user.email = data.email;
  user.username = data.username;

  //stat
  user.victories = 183;
  user.lost = 13;
  user.online = 160;
  user.local = 27;
  user.timeplay = 130;
  user.nbtotal = 1;
  user.friends = 0;
  // user.victories = data.victories;
  // user.lost = data.lost;
  // user.online = data.online;
  // user.local = data.local;
  // user.nbtotal = data.nbtotal;
  // user.timeplay = data.timeplay;
  // user.friends = data.friends;
};

const resetLocalUser = () => {
  // localStorage.setItem('isLogged', 'false');
  user.isAuthenticated = false;
  user.id = null;
  user.email = null;
  user.username = null;
  user.avatar = null;
  user.firstname = null;
  user.lastname = null;

  //stat
  user.victories = 0;
  user.lost = 0;
  user.online = 0;
  user.local = 0;
  user.timeplay = 0;
  user.nbtotal = 0;
  user.friends = 0;
  user.avatar = null;
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
        console.log("dwedededee",user.id);
        const userProfileResponse = await fetch(`http://127.0.0.1:8002/get_user_profile/${user.id}/`, {
          method: 'GET',
          credentials: 'include',
        });
        const userProfileData = await userProfileResponse.json();
        console.log(userProfileData);
        if (userProfileData.success) {
          setLocalUser(userProfileData);
        } else {
          console.error('Failed to load user profile:', userProfileData.message);
        }
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

const getCSRFToken = () => {
  const csrfTokenCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  if (csrfTokenCookie) {
    console.log('csrf find');
    //127.0.0.1:8000/#/
    http: return csrfTokenCookie.split('=')[1];
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
};

const getProfile = () => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar,
  };
};

const saveUser = async newUser => {

  console.log("object newUser saveUser", newUser);

  const formData = new FormData();
  formData.append('username', newUser.username);
  formData.append('email', newUser.email);
  formData.append('firstname', newUser.firstname);
  formData.append('lastname', newUser.lastname);
  formData.append('id', newUser.id);

  if (newUser.avatarFile) { 
    formData.append('avatar', newUser.avatarFile);
  }

  console.log("formData", formData);

  // Pour afficher le contenu de formData
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  try {
    const response = await fetch('http://127.0.0.1:8002/update_user/', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('La requête a échoué avec le statut ' + response.status);
    }

    const data = await response.json();
    console.log("Ladataaaaaa", data);

    if (data.success){
      //MAJ object user
      user.firstname = data.firstname;
      user.lastname = data.lastname;
      user.username = data.username;
      user.email = data.email;

      if (!data.avatar){
        user.avatar = 'assets/img/default-profile.jpg';
      }
      else{
        user.avatar = data.avatar;
      }
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'envoi des données de l'utilisateur:", error);
    return null;
  }
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
};

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
};

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
};

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
};

export {
  user,
  isAuthenticated,
  getCSRFToken,
  logout,
  getProfile,
  saveUser,
  getCsrfToken,
  loginUser,
  sendSignUpRequest,
  passwordReset,
  sendEmailPasswordReset,
  setLocalUser,
};
