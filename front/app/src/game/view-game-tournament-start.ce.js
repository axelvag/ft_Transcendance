import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import { getTournament, resetLocalTournament, fetchDeletePlayerstart, fetchAddPlayer, fetchDeleteTournament } from '@/tournament.js';
import { isAuthenticated } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '../router';

class ViewTournamentstart extends HTMLElement {
  #user;
  #tournament;
  #backUrl = '/'; // Définissez ici l'URL de redirection par défaut

  constructor() {
    super();
    console.log("Start Tournament");
    this.#user = getProfile();
    this.#tournament = getTournament();
  }

  async connectedCallback() {
    const isLoggedIn = await isAuthenticated();
    // Modifiez l'URL de redirection en fonction de l'état de connexion
    this.#backUrl = isLoggedIn ? '/game/tournament' : '/';

    const tabTournamentFront = this.generateTournamentTab();

    this.innerHTML = `
      <div class="min-vh-100 halo-bicolor d-flex flex-column p-2">
      <div class="row">
        <div class="col">
         <h1 class="fw-bold text-center m-0">${this.#tournament.name} Tournament</h1>
        </div>
        <div class="col">
          <button id="leaveTournamentBtn" class="btn btn-danger">Leave Tournament</button>
        </div>
      </div>

      <div id="tournamentTabFront" class="mt-4">${tabTournamentFront}</div>

    `;

    // Ajout d'un écouteur d'événements pour le bouton de sortie
    this.querySelector('#leaveTournamentBtn').addEventListener('click', () => {
      resetLocalTournament();
      this.deletePlayer();
      redirectTo(this.#backUrl);
    });

  }

  generateTournamentTab() {
    let message = ''; // Variable pour stocker le message à afficher

    switch (this.#tournament.maxPlayer) {
        case 4:
            return this.generateTournamentTab4();
        case 8:
            message = '8 Joueurs';
            break;
        case 12:
            message = '12 Joueurs';
            break;
        case 16:
            message = '16 Joueurs';
            break;
        default:
            message = 'Tournoi vide';
            break;
    }

    return message;
  }

  // Les cases des bracket avec le username personnalise
  cardTournament(username) {
    const user = getProfile();
    return `
    <div class="card text-center mb-3" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${username}</h5>
        <div class="d-flex justify-content-center">
          <img src="https://oasys.ch/wp-content/uploads/2019/03/photo-avatar-profil.png" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 50%;" width="90" height="90" alt="${user.username}">
        </div>
        <a href="#" class="btn btn-primary">Start Match</a>
      </div>
    </div>
    `;
  }

  // affiche les brackets pour 4 joueurs dans le tournoi
  generateTournamentTab4() {
    return `
    <div class="container text-center">
      <div class="row">
        <div class="col d-flex justify-content-center">
        <div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div>
        </div>
      </div>

      <div class="row">
        <div class="col d-flex justify-content-center">
          <div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div>
        </div>
        <div class="col d-flex justify-content-center">
          <div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div>
        </div>
      </div>
      <div class="row">
        <div class="col"><div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div></div>
        <div class="col"><div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div></div>
        <div class="col"><div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div></div>
        <div class="col"><div id="tournamentTabMessage" class="mt-4">${this.cardTournament("Axel")}</div></div>
      </div>
    
    </div>

    `;
  }

//   async generateTournamentTab4() {
//     try {
//       const response = await fetch(`http://127.0.0.1:8005/tournament/get_player/${this.#tournament.id}/`, {
//           method: 'GET',
//           headers: {
//               'Content-Type': 'application/json',
//               // 'Authorization': `Bearer ${token}`, // Si l'authentification est nécessaire
//           },
//       });

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       // const players = await response.json();

//       const listElement = this.querySelector('#playersList');
//       listElement.innerHTML = `
//       <div>
//         <div class="container text-center">
//           <div class="row">
//             <div class="col d-flex justify-content-center">
//               <div id="tournamentTabMessage" class="mt-4">${this.cardTournament()}</div>
//             </div>
//           </div>
//           <div class="row">
//             <div class="col d-flex justify-content-center">
//               <div id="tournamentTabMessage" class="mt-4">${this.cardTournament()}</div>
//             </div>
//             <div class="col d-flex justify-content-center">
//               <div id="tournamentTabMessage" class="mt-4">${this.cardTournament()}</div>
//             </div>
//           </div>
//         </div>
//       </div>
//       `;

//       // players.forEach(player => {
//       //     const playerElement = document.createElement('div');
//       //     playerElement.innerHTML = `
//       //       <div class="col"><div id="tournamentTabMessage" class="mt-4">${this.cardTournament()}</div></div>
//       //     `;
//       //     listElement.appendChild(playerElement);
//       // });

//   }
//   catch (error) {
//       console.error('Could not load tournament:', error);
//   }
//   }

}

customElements.define('view-game-tournament-start', ViewTournamentstart);