import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import { getTournament, resetLocalTournament } from '@/tournament.js';
import { isAuthenticated } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';

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
      </div>
    `;

    // Ajout d'un écouteur d'événements pour le bouton de sortie
    this.querySelector('#leaveTournamentBtn').addEventListener('click', () => {
      resetLocalTournament();
      window.location.href = this.#backUrl;
    });
  }
  async addPlayer() {

    const formData = {
      user_id: this.#user.id,
      username: this.#user.username,
      tournamentId: this.#tournament.id,
    };
    console.log(formData);
    // const response = await fetch('http://127.0.0.1:8005/tournament/create_tournament/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'X-CSRFToken': csrfToken,
    //   },
    //   credentials: 'include',
    //   body: JSON.stringify(formData),
    // })
    // const data = await response.json();
    // if (data.success) {
    //   console.log(data);
    // } else {
    //   console.log(data);
    // }
  }
}

customElements.define('view-game-tournament-salon', ViewTournamentSalon);

