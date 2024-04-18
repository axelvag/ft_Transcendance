import { redirectTo } from '@/router.js';
import { getProfile, getCsrfToken } from '@/auth.js';
import { notify } from '@/notifications.js';

const tournament = {
  id: null,
  name: null,
  maxPlayer: null,
  admin_id: null,
  status: null,
};

const setLocalTournament = data => {
  tournament.id = data.id || '';
  tournament.name = data.name || '';
  tournament.maxPlayer = data.maxPlayer || '';
  tournament.admin_id = data.admin_id || '';
  tournament.status = data.status || '';
};

const resetLocalTournament = () => {
  tournament.id = null;
  tournament.name = null;
  tournament.maxPlayer = null;
  tournament.admin_id = null;
  tournament.status = null;
};

const getTournament = () => {
  return {
    id: tournament.id,
    name: tournament.name,
    maxPlayer: tournament.maxPlayer,
    admin_id: tournament.admin_id,
    status: tournament.status,
  };
};

const match = {
  id: null,
  winner: null,
};

const setLocalMatch = data => {
  match.id = data.match_id || '';
  match.winner = data.player_1_id || '';
};

const resetLocalMatch = () => {
  match.id = null;
  match.winner = null;
};

const getMatch = () => {
  return {
    id: match.id,
    winner: match.winner,
  };
};

const fetchGetTournament = async (tournamentId) => {
  const response = await fetch(`http://127.0.0.1:8005/tournament/get/${tournamentId}/`, {
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
  const response = await fetch(`http://127.0.0.1:8005/tournament/get/${tournamentId}/`, {
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
  const response = await fetch('http://127.0.0.1:8005/tournament/create_tournament/', {
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
  const response = await fetch(`http://127.0.0.1:8005/tournament/delete_joueur/${user.id}`, {
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
  const response = await fetch(`http://127.0.0.1:8005/tournament/delete_joueur/${user.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
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
    },
    credentials: 'include',
  })
  const data = await response.json();
  console.log("tournoi infooooooooooo", data);
  if (data.id) {
    setLocalTournament(data);
  } else {
    console.log("player is not in a tournament");
  }
};

const fetchInfoMatch = async () => {
  let user = getProfile();
  const response = await fetch(`http://127.0.0.1:8005/tournament/get_latest_match_for_user/${user.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  const data = await response.json();
  console.log(data);
  if (data.success) {
    setLocalMatch(data.matches_data);
  } else {
    console.log("player is not in a match");
  }
};

const fetchCreateMatchs = async () => {
  const response = await fetch(`http://127.0.0.1:8005/tournament/create_matches/${tournament.id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchGetMatchs = async () => {
  const response = await fetch(`http://127.0.0.1:8005/tournament/get_matches/${tournament.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchWinnerMatch = async () => {
  const response = await fetch(`http://127.0.0.1:8005/tournament/update_winner/${match.id}/${match.winner}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};


const fetchDeletePlayerAndTournament = async () => {
  let user = getProfile();
  const response = await fetch(`http://127.0.0.1:8005/tournament/delete_player/${user.id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  const data = await response.json();
  console.log(data);
  if (data.success) {
    resetLocalTournament();
  } else {
    console.log("error");
  }
};

export { tournament, fetchDeletePlayerAndTournament, setLocalTournament, resetLocalTournament, getTournament, fetchGetTournament, fetchCreateTournament, fetchDeletePlayer, fetchDeletePlayerSalon, fetchAddPlayer, fetchDeleteTournament, fetchTournamentInfo, TournamentExist, fetchCreateMatchs, fetchGetMatchs, fetchInfoMatch, fetchWinnerMatch, getMatch };