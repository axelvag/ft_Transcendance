// import profilePic from './assets/img/profile.jpg';
import { redirectTo } from '@/router.js';
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
  avatarDefault: null,
  avatarDefault42: null,

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
  user.avatarDefault = 'assets/img/default-profile.jpg';
  user.avatarDefault42 = data.avatar42;

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
  user.avatarDefault = null;
  user.avatarDefault42 = null;

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
          console.log(userProfileData.avatar42);
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
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar,
    avatarDefault: user.avatarDefault,
    avatarDefault42: user.avatarDefault42,
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
    const csrfToken = await getCsrfToken();
    const response = await fetch('http://127.0.0.1:8001/accounts/update_user/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        // 'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('La requête a échoué avec le statut ' + response.status);
    }

    const data = await response.json();
    console.log("Ladataaaaaa", data);
    if (data.data.success){
      //MAJ object user
      user.firstname = data.data.firstname;
      user.lastname = data.data.lastname;
      user.username = data.data.username;
      user.email = user.email;

      if (!data.data.avatar){
        if(user.avatarDefault42 !== null && user.avatarDefault42 !== undefined)
          user.avatar = user.avatarDefault42;
        else
          user.avatar = 'assets/img/default-profile.jpg';
      }
      else{
        user.avatar = data.data.avatar;
      }
    }

    return data.data;
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

const handleOAuthResponse = async () => {
  if (window.location.search.includes("code=")) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    // console.log(code);
    try {
      const csrfToken = await getCsrfToken();
      console.log("csrftoken1");
      console.log(csrfToken);
      const authResponse = await fetch('http://127.0.0.1:8001/accounts/oauth/callback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ code: code })
      });

      const data = await authResponse.json();
      if (data.access_token) {
        user.id = data.id;
        user.email = data.email;
        user.username = data.username;
        user.avatar = data.avatar.link;
        user.firstname = data.firstname;
        user.lastname = data.lastname;
        user.avatarDefault42 = data.avatar.link;
        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('email', user.email);
        formData.append('firstname', user.firstname);
        formData.append('lastname', user.lastname);
        formData.append('id', user.id);
        formData.append('avatar', user.avatar);
        if(data.register === true){
          console.log("register trueeeeeeeeeeee");
          try {
          //   for (let [key, value] of formData.entries()) {
          //     console.log(`${key}: ${value}`);
          // }
            const csrfToken = await getCsrfToken();
            console.log("csrftoken2");
            console.log(csrfToken);
            const response = await fetch('http://127.0.0.1:8001/accounts/update_user/', {
              method: 'POST',
              headers: {
                // 'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
              },
              credentials: 'include',
              body: formData,
            });
        
            if (!response.ok) {
              throw new Error('La requête a échoué avec le statut ' + response.status);
            }
        
            const data = await response.json();
            console.log(data);
        
          } catch (error) {
            console.error("Erreur lors de l'envoi des données de l'utilisateur:", error);
          }
        }
        const userProfileResponse = await fetch(`http://127.0.0.1:8002/get_user_profile/${data.id}/`, {
          method: 'GET',
          credentials: 'include',
        });
        
        const userProfileData = await userProfileResponse.json();
        console.log(userProfileData);
        if (userProfileData.success) {
          console.log("yo");
          console.log(userProfileData.avatar42);
          setLocalUser(userProfileData);
          redirectTo('/dashboard');
        } else {
          console.error('Failed to load user profile:', userProfileData.message);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
};

const getAuthorizationCode = () => {
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-032700fdff8bf6b743669184234c5670698f0f0ef95b498514fc13b5e7af32f0&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Fauth42-callback&response_type=code`;
  window.location.href = url;
}  

export { user, isAuthenticated, logout, getProfile, getCsrfToken, loginUser, sendSignUpRequest, passwordReset, sendEmailPasswordReset, handleOAuthResponse, getAuthorizationCode, saveUser, setLocalUser, resetLocalUser};
