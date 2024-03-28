import { redirectTo } from '@/router.js';

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

export { tournament, setLocalTournament, resetLocalTournament, getTournament, fetchGetTournament };
