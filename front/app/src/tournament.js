import { redirectTo } from '@/router.js';
import { getProfile } from '@/auth.js';

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
  const response = await fetch(`http://127.0.0.1:8005/tournament/get/${tournamentId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
  });
  const data = await response.json();
  if (data.success) {
    setLocalTournament(data.data);
    console.log(data);
    redirectTo(`/game/tournament/waiting`);
  } else {
      console.error('Tournoi non trouvé ou erreur de récupération.');
  }
};

const fetchCreateTournament = async (formData) => {
  const response = await fetch('http://127.0.0.1:8005/tournament/create_tournament/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  })
  return response.json();
};

const fetchDeletePlayer = async () => {
  let user = getProfile();
  const response = await fetch(`http://127.0.0.1:8005/tournament/delete_joueur/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
  })
  const data = await response.json();
  if (data.success) {
    resetLocalTournament();
    console.log(data);
  } else {
    console.log("error");
  }
};

const fetchDeletePlayerSalon = async () => {
  let user = getProfile();
  const response = await fetch(`http://127.0.0.1:8005/tournament/delete_joueur/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchDeleteTournament = async () => {
  const response = await fetch(`http://127.0.0.1:8005/tournament/delete_tournment/${tournament.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchAddPlayer = async (formData) => {
  const response = await fetch('http://127.0.0.1:8005/tournament/create_joueur/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  })
  return response.json();
};

const fetchTournamentInfo = async () => {
  let user = getProfile();
  const response = await fetch(`http://127.0.0.1:8005/tournament/tournoi_info/${user.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
  })
  const data = await response.json();
  // console.log(data)
  if (data.id) {
    // resetLocalTournament();
    setLocalTournament(data);
    console.log(data);
  } else {
    console.log("player is not in a tournament");
  }
};

export { tournament, setLocalTournament, resetLocalTournament, getTournament, fetchGetTournament, fetchCreateTournament, fetchDeletePlayer, fetchDeletePlayerSalon, fetchAddPlayer, fetchDeleteTournament, fetchTournamentInfo };
