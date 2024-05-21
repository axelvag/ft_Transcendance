import { redirectTo } from '@/router.js';
import { fetchTournamentInfo, fetchDeletePlayer, getTournament } from '@/tournament.js';
import { notify } from '@/notifications.js';
import { BASE_URL, OAUTH_AUTHORIZE_URL } from '@/constants.js';
import { closeViewFriendWebSocket } from '@/views/view-friend.ce.js';

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
  user.avatar = avatar || '/assets/img/default-profile.jpg';
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
  user.avatarDefault = '/assets/img/default-profile.jpg';
  user.avatarDefault42 = data.avatar42;

  //stat
  user.victories = 183;
  user.lost = 13;
  user.online = 160;
  user.local = 27;
  user.timeplay = 130;
  user.nbtotal = 1;
  user.friends = 0;
};

const resetLocalUser = () => {
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
      const response = await fetch(`${BASE_URL}:8001/accounts/is_user_logged_in/`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setLocalUser(data);
        const userProfileResponse = await fetch(`${BASE_URL}:8002/get_user_profile/${user.id}/`, {
          credentials: 'include',
        });
        const userProfileData = await userProfileResponse.json();
        if (userProfileData.success) {
          setLocalUser(userProfileData);
          await fetchTournamentInfo();
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
  const response = await fetch(BASE_URL + ':8001/accounts/get-csrf-token/', {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  });
  if (response.ok) {
    const data = await response.json();
    return data.csrfToken;
  }
  throw new Error('Could not retrieve CSRF token');
};

const logout = async () => {
  try {
    await fetchTournamentInfo();
    let tournament = getTournament();
    if(tournament.status !== 1)
      await fetchDeletePlayer();
    closeViewFriendWebSocket();

    const csrfToken = await getCsrfToken();
    await fetch(`${BASE_URL}:8001/accounts/logout/`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
      },
    });
    notify({
      icon: 'info',
      iconClass: 'text-info',
      message: 'You have been <b>logged out</b> successfully!',
    });
  } catch (error) {
    console.error('Error:', error);
    notify({
      icon: 'error',
      iconClass: 'text-danger',
      message: 'Logout failed!',
      autohide: false,
    });
  }
  await resetLocalUser();
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
  const formData = new FormData();
  formData.append('username', newUser.username);
  formData.append('email', newUser.email);
  formData.append('firstname', newUser.firstname);
  formData.append('lastname', newUser.lastname);
  formData.append('id', newUser.id);

  if (newUser.avatarFile) {
    formData.append('avatar', newUser.avatarFile);
  }

  try {
    const csrfToken = await getCsrfToken();
    const response = await fetch(BASE_URL + ':8002/update_user/', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('La requête a échoué avec le statut ' + response.status);
    }

    const data = await response.json();
    if (data.success) {
      //MAJ object user
      user.firstname = data.firstname;
      user.lastname = data.lastname;
      user.username = data.username;
      user.email = user.email;

      if (!data.avatar) {
        if (user.avatarDefault42 !== null && user.avatarDefault42 !== undefined) user.avatar = user.avatarDefault42;
        else user.avatar = 'assets/img/default-profile.jpg';
      } else {
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
  try {
    const response = await fetch(BASE_URL + ':8001/accounts/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    return response.json();
  }
  catch (error) {
    console.error('Erreur:', error);
    notify({
      icon: 'error',
      iconClass: 'text-danger',
      message: 'delete user failed!',
    });
    return { success: false, error: error.message };
  }
};

const sendSignUpRequest = async (formData, csrfToken) => {
  try {
  const response = await fetch(BASE_URL + ':8001/accounts/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify(formData),
  });
  return response.json();
  }
  catch (error) {
    console.error('Erreur:', error);
    notify({
      icon: 'error',
      iconClass: 'text-danger',
      message: 'register user failed!',
    });
    return { success: false, error: error.message };
  }
};

const passwordReset = async (formData, csrfToken) => {
  try {
    const response = await fetch(BASE_URL + ':8001/accounts/password_reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    return response.json();
  }
  catch (error) {
    console.error('Erreur:', error);
    notify({
      icon: 'error',
      iconClass: 'text-danger',
      message: 'password reset failed!',
    });
    return { success: false, error: error.message };
  }
};

const sendEmailPasswordReset = async (formData, csrfToken, url) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    return response.json();
  }
  catch (error) {
    console.error('Erreur:', error);
    notify({
      icon: 'error',
      iconClass: 'text-danger',
      message: 'send email failed!',
    });
    return { success: false, error: error.message };
  }
};

const deleteUser = async csrfToken => {
  try {
    await fetchTournamentInfo();
    let tournament = getTournament();
    if(tournament.status !== 1)
      await fetchDeletePlayer();
    const url = `${BASE_URL}:8001/accounts/delete_user/${user.username}`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ user_id: user.id }),
    });
  
    const data = await response.json();
    if (data.success) {
      user.isAuthenticated = false;
      resetLocalUser(data);
      localStorage.setItem('isLogged', 'false');
    }
  }
  catch (error) {
    console.error('Erreur:', error);
    notify({
      icon: 'error',
      iconClass: 'text-danger',
      message: 'delete user failed!',
    });
  }
};

const handleOAuthResponse = async () => {
  if (window.location.search.includes('code=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    try {
      const csrfToken = await getCsrfToken();
      const authResponse = await fetch(BASE_URL + ':8001/accounts/oauth/callback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ code: code }),
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
        if (data.register === true) {
          try {
            const csrfToken = await getCsrfToken();
            const response = await fetch(BASE_URL + ':8002/update_user/', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'X-CSRFToken': csrfToken,
              },
              body: formData,
            });

            if (!response.ok) {
              throw new Error('La requête a échoué avec le statut ' + response.status);
            }

            const data = await response.json();
          } catch (error) {
            console.error("Erreur lors de l'envoi des données de l'utilisateur:", error);
          }
        }
        await fetchTournamentInfo();
        const userProfileResponse = await fetch(`${BASE_URL}:8002/get_user_profile/${data.id}/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-CSRFToken': csrfToken,
          },
        });
        const userProfileData = await userProfileResponse.json();
        if (userProfileData.success) {
          setLocalUser(userProfileData);
          redirectTo('/dashboard');
          notify({
            icon: 'info',
            iconClass: 'text-info',
            message: 'You have been <b>logged in</b> successfully!',
          });
        } else {
          console.error('Failed to load user profile:', userProfileData.message);
          notify({
            icon: 'error',
            iconClass: 'text-danger',
            message: 'Failed to load user profile!',
          });
        }
      } else {
        console.error('Failed Auth42', data.error);
        notifyError('Signin with 42 failed!');
        redirectTo('/');
      }
    } catch (error) {
      console.error('Erreur:', error);
      notifyError('Signin with 42 failed!');
      redirectTo('/');
    }
  }
};

const getAuthorizationCode = () => {
  window.location.href = OAUTH_AUTHORIZE_URL;
};

export {
  user,
  isAuthenticated,
  logout,
  deleteUser,
  getProfile,
  getCsrfToken,
  loginUser,
  sendSignUpRequest,
  passwordReset,
  sendEmailPasswordReset,
  handleOAuthResponse,
  getAuthorizationCode,
  saveUser,
  setLocalUser,
  resetLocalUser,
};
