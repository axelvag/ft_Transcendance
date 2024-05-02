import { redirectTo } from '@/router.js';
import { getProfile, getCsrfToken } from '@/auth.js';
import { notify } from '@/notifications.js';
import { BASE_URL } from '@/constants.js';

const tournament = {
  id: null,
  name: null,
  maxPlayer: null,
  admin_id: null,
  admin_username: null,
  status: null,
};

const setLocalTournament = data => {
  tournament.id = data.id || '';
  tournament.name = data.name || '';
  tournament.maxPlayer = data.maxPlayer || '';
  tournament.admin_id = data.admin_id || '';
  tournament.status = data.status || 0;
  tournament.admin_username = data.admin_username || '';
};

const resetLocalTournament = () => {
  tournament.id = null;
  tournament.name = null;
  tournament.maxPlayer = null;
  tournament.admin_id = null;
  tournament.status = null;
  tournament.admin_username = null;
};

const getTournament = () => {
  return {
    id: tournament.id,
    name: tournament.name,
    maxPlayer: tournament.maxPlayer,
    admin_id: tournament.admin_id,
    status: tournament.status,
    admin_username: tournament.admin_username,
  };
};

const match = {
  id: null,
  winner: null,
  status: null,
  player1id: null,
  player2id: null,
  leave: null,
};

const setLocalMatch = data => {
  match.id = data.match_id || '';
  match.winner = data.player_1_id || '';
  match.status = data.status || 0;
  match.player1id = data.player_1_id || '';
  match.player2id = data.player_2_id || '';
  match.leave = data.leave || 0;
};

const resetLocalMatch = () => {
  match.id = null;
  match.winner = null;
  match.status = null;
  match.player1id = null;
  match.player2id = null;
  match.leave = null;
};

const getMatch = () => {
  return {
    id: match.id,
    winner: match.winner,
    status: match.status,
    player1id: match.player1id,
    player2id: match.player2id,
    leave: match.leave,
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
  console.log(data);
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
  console.log("sidebarrrrrrrrrrrr", data);
  console.log(data.status);
  if (data.success) {
    if(data.data.status === 1){
      console.log("start");
      redirectTo(`/game/tournament/start`);
    }
    else
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
  console.log("tournoi infooooooooooo", data);
  if (data.id) {
    // if(data.status !== 2)
      setLocalTournament(data);
    // else
    //   await fetchDeletePlayerAndTournament();
  } else {
    console.log("player is not in a tournament");
  }
};

const fetchInfoMatch = async () => {
  let user = getProfile();
  const response = await fetch(`${BASE_URL}:8005/tournament/get_latest_match_for_user/${user.id}/${tournament.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  const data = await response.json();
  console.log("last match", data);
  if (data.success) {
    setLocalMatch(data.matches_data);
  } else {
    console.log("player is not in a match");
  }
};

const fetchCreateMatchs = async () => {
  const response = await fetch(`${BASE_URL}:8005/tournament/create_matches/${tournament.id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchGetMatchs = async () => {
  const response = await fetch(`${BASE_URL}:8005/tournament/get_matches/${tournament.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchWinnerMatch = async () => {
  const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchLeaveMatch = async () => {
  let user = getProfile();
  if(user.id === match.player1id)
    match.winner = match.player2id;
  else
    match.winner = match.player1id;
  const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const updateWinnerLeave = async () => {
  if(match.leave === 1)
    match.winner = match.player2id;
  else 
    match.winner = match.player1id;
  const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
};

const fetchLeaveMatchAlone = async () => {
  let user = getProfile();
  let player;
  if(user.id === match.player1id)
    player = 1;
  else
    player = 2;
  const response = await fetch(`${BASE_URL}:8005/tournament/update_leave/${match.id}/${player}/`, {
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
  const response = await fetch(`${BASE_URL}:8005/tournament/delete_player/${user.id}/`, {
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
    resetLocalMatch();
  } else {
    console.log("error");
  }
};

export { tournament, updateWinnerLeave, fetchLeaveMatch, fetchDeletePlayerAndTournament, setLocalTournament, resetLocalTournament, getTournament, fetchGetTournament, fetchCreateTournament, fetchDeletePlayer, fetchDeletePlayerSalon, fetchAddPlayer, fetchDeleteTournament, fetchTournamentInfo, TournamentExist, fetchCreateMatchs, fetchGetMatchs, fetchInfoMatch, fetchWinnerMatch, getMatch, fetchLeaveMatchAlone };
