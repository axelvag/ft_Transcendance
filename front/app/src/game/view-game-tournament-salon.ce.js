import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import { getTournament, resetLocalTournament, fetchDeletePlayerSalon, fetchAddPlayer, fetchDeleteTournament , fetchTournamentInfo, fetchDeletePlayerAndTournament} from '@/tournament.js';
import { isAuthenticated, getCsrfToken } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '../router';
import { BASE_URL, WS_BASE_URL } from '@/constants.js';
import { notify } from '@/notifications.js';

class ViewTournamentSalon extends HTMLElement {
  #user;
  #tournament;
  #backUrl = '/'; // Définissez ici l'URL de redirection par défaut

  constructor() {
    super();
    this.#user = getProfile();
  }
  
  async connectedCallback() {
    await fetchTournamentInfo();
    this.#tournament = getTournament();
    const isLoggedIn = await isAuthenticated();
    // Modifiez l'URL de redirection en fonction de l'état de connexion
    this.#backUrl = isLoggedIn ? '/game/tournament' : '/';
    if(this.#tournament.id === null || this.#tournament.status !== 0){
      if(this.#tournament.status === 2)
        await fetchDeletePlayerAndTournament();
      if(this.#tournament.status === 1){
        redirectTo(`/game/tournament/start`);
        return;
      }
      redirectTo(this.#backUrl);
      return;
    }

    let deleteTournamentButtonHTML = '';
    if (this.#user.id === this.#tournament.admin_id) {
        // Si l'utilisateur actuel est l'administrateur du tournoi, ajouter le HTML du bouton de suppression
        deleteTournamentButtonHTML = `<button id="deleteTournamentBtn" class="btn btn-warning">Delete Tournament</button>`;
    }

    let buttonsHTML = '';
    if (this.#tournament.maxPlayer - 1 !== this.#tournament.nombreDeJoueur) {
        buttonsHTML = `
          <div class="d-flex justify-content-between align-items-center mb-5">
            <button id="leaveTournamentBtn" class="btn btn-danger">Leave Tournament</button>
            ${deleteTournamentButtonHTML}  <!-- Ajout du bouton de suppression si applicable -->
          </div>
        `;
    }

    this.innerHTML = `
      <div class="min-vh-100 halo-bicolor d-flex flex-column p-2">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <h1 class="fw-bold text-center m-0">Waiting room for ${this.#tournament.name} Tournament</h1>
          ${buttonsHTML}
        </div>
        <div id="playersList" class="mt-4"></div>
      </div>
    `;

    // Ajout d'un écouteur d'événements pour le bouton de sortie
    this.querySelector('#leaveTournamentBtn')?.addEventListener('click', () => {
      resetLocalTournament();
      this.deletePlayer();
      redirectTo(this.#backUrl);
    });

    const deleteBtn = this.querySelector('#deleteTournamentBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {

            this.deleteTournament();
        });
    }

    await this.initWebSocket();
    // this.addPlayer();
  }

  disconnectedCallback() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  async addPlayer() {
    const formData = {
      user_id: this.#user.id,
      username: this.#user.username,
      tournament_id: this.#tournament.id,
    };
    const data = await fetchAddPlayer(formData);
    console.log(data);
    if (data.success === false) {
      this.viewPlayer();
    }
  }
  
  async deletePlayer() {
    const data = await fetchDeletePlayerSalon();
  }
  
  async deleteTournament() {
    const data = await fetchDeleteTournament();
    if (data.success) {
      resetLocalTournament();
      redirectTo(this.#backUrl);
    } else {
      console.log("error");
    }
  }

  async viewPlayer() {
    try {
        const response = await fetch(`${BASE_URL}:8005/tournament/get_player/${this.#tournament.id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const players = await response.json();
        console.log(players);
        const listElement = this.querySelector('#playersList');
        listElement.innerHTML = '<h2>Players in the Tournaments</h2><br>'; // Titre pour la section

        for (const player of players) {
            let avatar = "/assets/img/default-profile.jpg";
            if(player.avatar42 !== null && player.avatar42 !== undefined)
              avatar = player.avatar42;
            if (player.avatar !== null && player.avatar !== undefined)
              avatar = player.avatar;
            const playerElement = document.createElement('div');
            playerElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; flex-direction: column;">
                        <h3>${player.username}</h3> 
                        <img
                          src="${avatar}" 
                          class="d-block object-fit-cover rounded-circle m-n1"
                          width="28"
                          height="28"
                        />
                    </div>
                </div>
                <hr style="border-top: 1px solid #ccc; margin: 10px 0;">
            `;
            listElement.appendChild(playerElement);
        }

        // Calculer le nombre de joueurs en attente
        const nbPlayersWaiting = this.#tournament.maxPlayer - players.length;
        console.log(this.#tournament.maxPlayer);
        console.log(players.length);
        if (nbPlayersWaiting === 0) {
          this.startCountdownAndRedirect(listElement);
          // redirectTo(`/game/tournament/start`);
          // return;
        }
        else{
          const waitingElement = document.createElement('div');
          waitingElement.innerHTML = `<h3>${nbPlayersWaiting} player(s) waiting</h3>`;
          listElement.appendChild(waitingElement);
        }

    } catch (error) {
        console.error('Could not load tournament:', error);
    }
}

startCountdownAndRedirect(listElement) {
  let countdown = 5;
  const countdownElement = document.createElement('div');
  countdownElement.setAttribute('id', 'countdown');
  listElement.appendChild(countdownElement);

  const intervalId = setInterval(() => {
      if (countdown === 0) {
          clearInterval(intervalId);
          redirectTo(`/game/tournament/start`);
      } else {
          countdownElement.innerHTML = `<h3>Tournament starts in ${countdown}...</h3>`;
          countdown--;
      }
  }, 1000);
}

 updateButtons() {
  // Exemple de condition pour afficher ou masquer les boutons

  const leaveTournamentBtn = document.getElementById('leaveTournamentBtn');
  const deleteTournamentBtn = document.getElementById('deleteTournamentBtn');

  leaveTournamentBtn.style.display = 'none';  // Masquer le bouton
  if (deleteTournamentBtn) {
      deleteTournamentBtn.style.display = 'none';  // Masquer si applicable
  }
}


  initWebSocket() {
    // Assurez-vous que l'URL correspond à votre serveur WebSocket.
    this.socket = new WebSocket(WS_BASE_URL + ':8005/tournament/websocket/');

    this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.socket.send(JSON.stringify({tournoi_id: this.#tournament.id}));
        this.socket.send(JSON.stringify({user_id: this.#user.id}));
        this.addPlayer();
    };

    this.socket.onmessage = (event) => {
        // Logique pour gérer les messages entrants.
        const data = JSON.parse(event.data);

        if (data.action === 'add_Player') {
            this.viewPlayer();
        }
        if (data.action === 'disconnect') {
          socket.close();
        }
        if (data.action === 'delete_tournament') {
          resetLocalTournament();
          this.deletePlayer();
          redirectTo(this.#backUrl);
          notify({
            icon: 'info',
            iconClass: 'text-info',
            message: `The tournament has been deleted !</b>`,
          });
          this.socket.close();
        }
        if (data.action === 'display_player') {
          this.viewPlayer();
        }
        
        if (data.action === 'update_boutton') {
          this.updateButtons();
        }
    };

    this.socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    window.addEventListener('beforeunload', () => {
      this.socket.close();
    });

  }
}

customElements.define('view-game-tournament-salon', ViewTournamentSalon);

