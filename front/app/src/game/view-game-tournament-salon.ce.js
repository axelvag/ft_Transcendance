import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import { getTournament, resetLocalTournament } from '@/tournament.js';
import { isAuthenticated } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '../router';

class ViewTournamentSalon extends HTMLElement {
  #user;
  #tournament;
  #backUrl = '/'; // Définissez ici l'URL de redirection par défaut

  constructor() {
    super();
    console.log("Waiting room");
    this.#user = getProfile();
    this.#tournament = getTournament();
  }

  async connectedCallback() {
    const isLoggedIn = await isAuthenticated();
    // Modifiez l'URL de redirection en fonction de l'état de connexion
    this.#backUrl = isLoggedIn ? '/game/tournament' : '/';

    // Ajout du bouton "Leave Tournament" avec un style rouge et un gestionnaire d'événements
    this.innerHTML = `
      <div class="min-vh-100 halo-bicolor d-flex flex-column p-2">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <h1 class="fw-bold text-center m-0">Waiting room for ${this.#tournament.name} Tournament</h1>
          <button id="leaveTournamentBtn" class="btn btn-danger">Leave Tournament</button>
        </div>
        <div id="playersList" class="mt-4"></div>
      </div>
    `;

    // Ajout d'un écouteur d'événements pour le bouton de sortie
    this.querySelector('#leaveTournamentBtn').addEventListener('click', () => {
      resetLocalTournament();
      this.deletePlayer();
      redirectTo(this.#backUrl);
    });
    this.addPlayer();
  }

  async addPlayer() {

    const formData = {
      user_id: this.#user.id,
      username: this.#user.username,
      tournament_id: this.#tournament.id,
    };
    console.log(formData);
    const response = await fetch('http://127.0.0.1:8005/tournament/create_joueur/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
    const data = await response.json();
    if (data.success) {
      console.log(data);
      this.viewPlayer();
    } else {
      console.log("error");
      this.viewPlayer();
    }
  }
  
  async deletePlayer() {
    const response = await fetch(`http://127.0.0.1:8005/tournament/delete_joueur/${this.#user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    })
    const data = await response.json();
    if (data.success) {
      console.log(data);
      this.viewPlayer();
    } else {
      console.log("error");
    }
  }

  async viewPlayer() {
    try {
        const response = await fetch(`http://127.0.0.1:8005/tournament/get_player/${this.#tournament.id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`, // Si l'authentification est nécessaire
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const players = await response.json();

        const listElement = this.querySelector('#playersList');
        listElement.innerHTML = '<h2>Players in the Tournaments</h2><br>'; // Titre pour la section

        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; flex-direction: column;">
                        <h3>${player.username}</h3>
                    </div>
                </div>
                <hr style="border-top: 1px solid #ccc; margin: 10px 0;">
            `;
            listElement.appendChild(playerElement);
        });

        // Calculer le nombre de joueurs en attente
        const nbPlayersWaiting = this.#tournament.maxPlayer - players.length;
        console.log(this.#tournament.maxPlayer);
        console.log(players.length);
        const waitingElement = document.createElement('div');
        waitingElement.innerHTML = `<h3>${nbPlayersWaiting} player(s) waiting</h3>`;
        listElement.appendChild(waitingElement);

    } catch (error) {
        console.error('Could not load tournament:', error);
    }
  }
}

customElements.define('view-game-tournament-salon', ViewTournamentSalon);

