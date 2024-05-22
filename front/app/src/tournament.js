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
  nombreDeJoueur: null,
};

const setLocalTournament = data => {
  tournament.id = data.id || '';
  tournament.name = data.name || '';
  tournament.maxPlayer = data.maxPlayer || '';
  tournament.admin_id = data.admin_id || '';
  tournament.status = data.status || 0;
  tournament.admin_username = data.admin_username || '';
  tournament.nombreDeJoueur = data.nombreDeJoueur || 0;
};

const resetLocalTournament = () => {
  tournament.id = null;
  tournament.name = null;
  tournament.maxPlayer = null;
  tournament.admin_id = null;
  tournament.status = null;
  tournament.admin_username = null;
  tournament.nombreDeJoueur = null;
};

const getTournament = () => {
  return {
    id: tournament.id,
    name: tournament.name,
    maxPlayer: tournament.maxPlayer,
    admin_id: tournament.admin_id,
    status: tournament.status,
    admin_username: tournament.admin_username,
    nombreDeJoueur: tournament.nombreDeJoueur,
  };
};

const match = {
  id: null,
  winner: null,
  status: null,
  player1id: null,
  player2id: null,
  leave: null,
  game_id: null,
  player1ready: null,
  player2ready: null,
};

const setLocalMatch = data => {
  match.id = data.match_id || '';
  match.winner = data.player_1_id || '';
  match.status = data.status || 0;
  match.player1id = data.player_1_id || '';
  match.player2id = data.player_2_id || '';
  match.leave = data.leave || 0;
  match.game_id = data.game_id || null;
  match.player1ready = data.player1ready || 0;
  match.player2ready = data.player2ready || 0;
};

const resetLocalMatch = () => {
  match.id = null;
  match.winner = null;
  match.status = null;
  match.player1id = null;
  match.player2id = null;
  match.leave = null;
  match.player1ready = null;
  match.player2ready = null;
};

const getMatch = () => ({ ...match });

const fetchGetTournament = async tournamentId => {
  try {
    const response = await fetch(`${BASE_URL}:8005/tournament/get/${tournamentId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const TournamentExist = async tournamentId => {
  try {
    const response = await fetch(`${BASE_URL}:8005/tournament/get/${tournamentId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      if (data.data.status === 1) {
        redirectTo(`/game/tournament/start`);
      } else {
        redirectTo(`/game/tournament/waiting`);
      }
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
  } catch (error) {
    console.error('An error occurred:', error);
    redirectTo(`/game/tournament`);
    notify({
      icon: 'info',
      iconClass: 'text-info',
      message: `An error occurred while fetching the tournament</b>`,
    });
  }
};

const fetchCreateTournament = async formData => {
  try {
    const response = await fetch(BASE_URL + ':8005/tournament/create_tournament/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchDeletePlayer = async () => {
  try {
    let user = getProfile();
    const response = await fetch(`${BASE_URL}:8005/tournament/delete_joueur/${user.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      resetLocalTournament();
    } else {
      console.log('error');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const fetchDeletePlayerSalon = async () => {
  try {
    let user = getProfile();
    const response = await fetch(`${BASE_URL}:8005/tournament/delete_joueur/${user.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchDeleteTournament = async () => {
  try {
    const response = await fetch(`${BASE_URL}:8005/tournament/delete_tournment/${tournament.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchAddPlayer = async formData => {
  try {
    const response = await fetch(BASE_URL + ':8005/tournament/create_joueur/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchTournamentInfo = async () => {
  try {
    let user = getProfile();
    const response = await fetch(`${BASE_URL}:8005/tournament/tournoi_info/${user.id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.id) {
      setLocalTournament(data);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const fetchInfoMatch = async () => {
  if (tournament.id !== null) {
    try {
      let user = getProfile();
      const response = await fetch(
        `${BASE_URL}:8005/tournament/get_latest_match_for_user/${user.id}/${tournament.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setLocalMatch(data.matches_data);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
};

const fetchCreateMatchs = async () => {
  try {
    const response = await fetch(`${BASE_URL}:8005/tournament/create_matches/${tournament.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchGetMatchs = async () => {
  try {
    if (tournament.id === null) {
      return { success: false, error: 'Tournament ID is null' };
    }

    const response = await fetch(`${BASE_URL}:8005/tournament/get_matches/${tournament.id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchWinnerMatch = async (winner, scorePlayer1, scroePlayer2) => {
  try {
    const response = await fetch(
      `${BASE_URL}:8005/tournament/update_winner/${match.id}/${winner}/${scorePlayer1}/${scroePlayer2}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchLeaveMatch = async () => {
  try {
    let user = getProfile();
    if (user.id === match.player1id) match.winner = match.player2id;
    else match.winner = match.player1id;

    const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/${0}/${0}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const updateWinnerLeave = async () => {
  try {
    if (match.leave === 1) match.winner = match.player2id;
    else match.winner = match.player1id;

    const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/${0}/${0}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchLeaveMatchAlone = async () => {
  try {
    let user = getProfile();
    let player;

    if (user.id === match.player1id) player = 1;
    else player = 2;

    const response = await fetch(`${BASE_URL}:8005/tournament/update_leave/${match.id}/${player}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

const fetchUserNobodyReadyTime = async () => {
  match.winner = Math.random() < 0.5 ? match.player1id : match.player2id;
  const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/${0}/${0}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return response.json();
};

const fetchUserOneReadyTime = async winnerId => {
  match.winner = winnerId; // Attribuer le gagnant
  const response = await fetch(`${BASE_URL}:8005/tournament/update_winner/${match.id}/${match.winner}/${0}/${0}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return response.json();
};

const fetchDeletePlayerAndTournament = async () => {
  try {
    let user = getProfile();
    if (user.id === null) {
      return { success: false, error: 'User ID is null' };
    }

    const response = await fetch(`${BASE_URL}:8005/tournament/delete_player/${user.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      resetLocalTournament();
      resetLocalMatch();
    } else {
      console.log('error');
    }

    return data;
  } catch (error) {
    console.error('An error occurred:', error);
    return { success: false, error: error.message };
  }
};

export {
  tournament,
  updateWinnerLeave,
  fetchWinnerMatch,
  fetchLeaveMatch,
  fetchDeletePlayerAndTournament,
  setLocalTournament,
  resetLocalTournament,
  getTournament,
  fetchGetTournament,
  fetchCreateTournament,
  fetchDeletePlayer,
  fetchDeletePlayerSalon,
  fetchAddPlayer,
  fetchDeleteTournament,
  fetchTournamentInfo,
  TournamentExist,
  fetchCreateMatchs,
  fetchGetMatchs,
  fetchInfoMatch,
  getMatch,
  fetchLeaveMatchAlone,
  fetchUserNobodyReadyTime,
  fetchUserOneReadyTime,
};
