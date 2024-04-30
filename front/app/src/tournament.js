import { redirectTo } from '@/router.js';
import { getProfile, getCsrfToken } from '@/auth.js';
import { notify } from '@/notifications.js';
import { BASE_URL } from '@/constants.js';

const tournament = {
  id: null,
  name: null,
  maxPlayer: null,
  admin_id: null,
};

const setLocalTournament = data => {
  tournament.id = data.id || '';
  tournament.name = data.name || '';
  tournament.maxPlayer = data.maxPlayer || '';
  tournament.admin_id = data.admin_id || '';
};

const resetLocalTournament = () => {
  tournament.id = null;
  tournament.name = null;
  tournament.maxPlayer = null;
  tournament.admin_id = null;
};

const getTournament = () => {
  return {
    id: tournament.id,
    name: tournament.name,
    maxPlayer: tournament.maxPlayer,
    admin_id: tournament.admin_id,
  };
};

const fetchGetTournament = async (tournamentId) => {
  const response = await fetch(`${BASE_URL}:8005/tournament/get/${tournamentId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await response.json();
  if (data.success) {
    setLocalTournament(data.data);
    redirectTo(`/game/tournament/waiting`);
    notify({
      icon: 'info',
      iconClass: 'text-info',
      message: `The tournament was successfully joined</b>`,
    });
  } else {
      console.error('Tournoi non trouvé ou erreur de récupération.');
  }
};

const TournamentExist = async (tournamentId) => {
  const response = await fetch(`${BASE_URL}:8005/tournament/get/${tournamentId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await response.json();
  if (data.success) {
    redirectTo(`/game/tournament/waiting`);
    notify({
      icon: 'info',
      iconClass: 'text-info',
      message: `The tournament was successfully joined</b>`,
    });
  } else {
    redirectTo(`/game/tournament`);
    notify({
      icon: 'info',
      iconClass: 'text-info',
      message: `The tournament has been deleted !</b>`,
    });
  }
};

const fetchCreateTournament = async (formData) => {
  const response = await fetch(BASE_URL + ':8005/tournament/create_tournament/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  })
  return response.json();
};

const fetchDeletePlayer = async () => {
  let user = getProfile();
  const response = await fetch(`${BASE_URL}:8005/tournament/delete_joueur/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  const data = await response.json();
  if (data.success) {
    resetLocalTournament();
  } else {
    console.log("error");
  }
};

const fetchDeletePlayerSalon = async () => {
  let user = getProfile();
  const response = await fetch(`${BASE_URL}:8005/tournament/delete_joueur/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchDeleteTournament = async () => {
  const response = await fetch(`${BASE_URL}:8005/tournament/delete_tournment/${tournament.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchAddPlayer = async (formData) => {
  const response = await fetch(BASE_URL + ':8005/tournament/create_joueur/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  })
  return response.json();
};

const fetchTournamentInfo = async () => {
  let user = getProfile();
  const response = await fetch(`${BASE_URL}:8005/tournament/tournoi_info/${user.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  const data = await response.json();
  if (data.id) {
    setLocalTournament(data);
  } else {
    console.log("player is not in a tournament");
  }
};

export { tournament, setLocalTournament, resetLocalTournament, getTournament, fetchGetTournament, fetchCreateTournament, fetchDeletePlayer, fetchDeletePlayerSalon, fetchAddPlayer, fetchDeleteTournament, fetchTournamentInfo, TournamentExist };
