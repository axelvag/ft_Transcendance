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

export { tournament, setLocalTournament, resetLocalTournament, getTournament };
