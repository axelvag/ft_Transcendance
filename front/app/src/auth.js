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

const saveAvatar = async formData => {
  try {
    const response = await fetch('http://127.0.0.1:8002/save_avatar/', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Échec de la mise à jour de l'avatar avec le statut ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("Échec de la mise à jour de l'avatar");
    }
    setLocalAvatar(data.avatar);
    return data;
  } catch (error) {
    return { success: false, avatar: '' };
  }
};

// const saveUser = async newUser => {
//   try {
//     const response = await fetch('http://127.0.0.1:8002/update_user/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // 'X-CSRFToken': getCSRFToken(),
//       },
//       credentials: 'include',
//       body: JSON.stringify(newUser),
//     });

//     if (!response.ok) {
//       throw new Error('La requête a échoué avec le statut ' + response.status);
//     }

//     const data = await response.json();

//     console.log(data);

//     user.firstname = data.firstname;
//     user.lastname = data.lastname;
//     user.username = data.username;
//     user.email = data.email;
//     user.avatar = data.avatar;

//     return data;
//   } catch (error) {
//     console.error("Erreur lors de l'envoi des données de l'utilisateur:", error);
//     return null;
//   }
// };

const saveUser = async newUser => {

  console.log("object newUser saveUser", newUser);

  const formData = new FormData();
  formData.append('username', newUser.username);
  formData.append('email', newUser.email);
  formData.append('firstname', newUser.firstname);
  formData.append('lastname', newUser.lastname);
  formData.append('id', newUser.id);

  // Vérifiez si avatarURL est un blob et ajoutez-le seulement dans ce cas
  // if (newUser.avatar && newUser.avatar.startsWith('blob:')) {
  //   formData.append('avatar', newUser.avatarFile); // Assurez-vous de passer l'objet File, pas l'URL
  // }

  if (newUser.avatarFile) { // Assurez-vous que newUser.avatarFile est défini et contient l'objet File de l'avatar
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
    console.log(data);

    //MAJ object user
    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.username = data.username;
    user.email = data.email;
    user.avatar = data.avatar;
    newUser.avatar = data.avatar;

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
  saveAvatar,
  saveUser,
  getCsrfToken,
  loginUser,
  sendSignUpRequest,
  passwordReset,
  sendEmailPasswordReset,
  setLocalUser,
};
