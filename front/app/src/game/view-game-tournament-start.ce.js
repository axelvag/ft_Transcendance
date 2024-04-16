import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import {
  getTournament,
  resetLocalTournament,
  fetchDeletePlayerSalon,
  fetchAddPlayer,
  fetchDeleteTournament,
  fetchCreateMatchs,
  fetchGetMatchs,
} from '@/tournament.js';
import { isAuthenticated, getCsrfToken } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '@/router.js';

class ViewTournamentstart extends HTMLElement {
  #user;
  #tournament;
  #backUrl = '/'; // Définissez ici l'URL de redirection par défaut

  constructor() {
    super();
    console.log('Start Tournament');
    this.#user = getProfile();
    this.#tournament = getTournament();
    console.log(this.#tournament.id);
  }

  async connectedCallback() {
    const isLoggedIn = await isAuthenticated();
    // Modifiez l'URL de redirection en fonction de l'état de connexion
    this.#backUrl = isLoggedIn ? '/game/tournament' : '/';

    // const tabTournamentFront = this.generateTournamentTab();

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

      <div id="tournamentTabFront" class="mt-4"></div>

    `;

    // Ajout d'un écouteur d'événements pour le bouton de sortie
    this.querySelector('#leaveTournamentBtn').addEventListener('click', () => {
      resetLocalTournament();
      this.deletePlayer();
      redirectTo(this.#backUrl);
    });

    await this.createMatchs();
  }

  async createMatchs() {
    const data = await fetchCreateMatchs();
    console.log(data);
    if (data.success) {
      console.log("Matchs created");
      const matches = await fetchGetMatchs();
      console.log(matches);
      if (matches.success)
        this.displayMatches(matches.matches_by_tour);
      else 
        console.log("error : get matchs failled !");
    } else {
      console.log("error : create matchs failled !");
    }
  }

//   displayMatches(matches) {
//     const tournamentTabElement = this.querySelector('#tournamentTabFront');
//     tournamentTabElement.innerHTML = ''; // Effacer les matchs précédents

//     // Filtrer et afficher seulement les matchs impliquant l'utilisateur connecté
//     matches.forEach((match) => {
//       const matchElement = document.createElement('div');
//       matchElement.classList.add('match');

//       let avatarImg1 = match.player_1_avatar || "/assets/img/default-profile.jpg";
//       let avatarImg2 = match.player_2_avatar || "/assets/img/default-profile.jpg";
//         if (this.#user.id === match.player_1_id || this.#user.id === match.player_2_id) {
//             const isPlayer1 = this.#user.id === match.player_1_id;
//             const isPlayer2 = this.#user.id === match.player_2_id;
//             const buttonPlayer1 = isPlayer1 ? (match.player_1_ready ? 'Not Ready' : 'Prêt') : '';
//             const buttonPlayer2 = isPlayer2 ? (match.player_2_ready ? 'Not Ready' : 'Prêt') : '';
//             let readyIconPlayer1 = match.player_1_ready ? '<span class="icon-check" style="color:green;">✔</span>' : '<span class="icon-cross" style="color:red;">✖</span>';
//             let readyIconPlayer2 = match.player_2_ready ? '<span class="icon-check" style="color:green;">✔</span>' : '<span class="icon-cross" style="color:red;">✖</span>';

//             matchElement.innerHTML = `
//               <div class="match-info>
//                 <div class="player-info d-flex align-items-center">
//                   <img src="${avatarImg1}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />
//                   <span class="player">${match.player_1_username}</span>
//                   ${isPlayer1 ? `<button id="ready-player1-${match.match_id}" class="ready-button">${buttonPlayer1}</button>` : readyIconPlayer1}
//                 </div>
//                 <div class="vs">vs</div>
//                 <div class="player-info d-flex align-items-center">
//                   <img src="${avatarImg2}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />
//                   <span class="player">${match.player_2_username}</span>
//                   ${isPlayer2 ? `<button id="ready-player2-${match.match_id}" class="ready-button">${buttonPlayer2}</button>` : readyIconPlayer2}
//                 </div>
//                 <br>
//                 <br>
//               </div>
//               `;
//         }
//         else{
//           matchElement.innerHTML = `
//           <div class="match-info">
//             <div class="player-info d-flex align-items-center">
//               <img src="${avatarImg1}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />
//               <span class="player">${match.player_1_username}</span>
//             </div>
//             <div class="vs">vs</div>
//             <div class="player-info d-flex align-items-center">
//               <img src="${avatarImg2}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />
//               <span class="player">${match.player_2_username}</span>
//             </div>
//             <br>
//             <br>
//           </div>
//         `;
//         }
//             // Attacher un gestionnaire d'événements pour le bouton "Prêt" si visible
//             if (this.#user.id === match.player_1_id) {
//                 const player1ReadyButton = matchElement.querySelector(`#ready-player1-${match.match_id}`);
//                 player1ReadyButton.addEventListener('click', () => this.handleReadyButtonClick(match.player_1_id));
//             }
//             if (this.#user.id === match.player_2_id) {
//                 const player2ReadyButton = matchElement.querySelector(`#ready-player2-${match.match_id}`);
//                 player2ReadyButton.addEventListener('click', () => this.handleReadyButtonClick(match.player_2_id));
//             }

//             // Ajouter l'élément de match à la div de tournoi
//             tournamentTabElement.appendChild(matchElement);
//     });
// }

displayMatches(matchesByTour) {
  const tournamentTabElement = this.querySelector('#tournamentTabFront');
  tournamentTabElement.innerHTML = ''; // Effacer les matchs précédents
  tournamentTabElement.style.display = 'flex'; // Aligner les conteneurs de tours horizontalement
  tournamentTabElement.style.flexDirection = 'row'; // Aligner les éléments en ligne
  tournamentTabElement.style.overflowX = 'auto'; // Défilement horizontal si nécessaire

  const totalTours = matchesByTour.length; // Nombre total de tours

  matchesByTour.forEach((matches, tourIndex) => {
      const tourElement = document.createElement('div');
      tourElement.classList.add('tour');
      tourElement.style.display = 'flex';
      tourElement.style.flexDirection = 'column'; // Alignement vertical des matchs dans le tour
      tourElement.style.marginRight = '150px'; // Espacement entre les tours

      let tourTitle;
      if (tourIndex === totalTours - 1) {
          tourTitle = "Finale";
      } else if (tourIndex === totalTours - 2) {
          tourTitle = "Demi-finale";
      } else {
          tourTitle = `Tour ${tourIndex + 1}`;
      }

      const titleElement = document.createElement('h3');
      titleElement.textContent = tourTitle;
      tourElement.appendChild(titleElement);

      matches.forEach((match) => {
          const matchElement = document.createElement('div');
          matchElement.classList.add('match');

          let player1Name = match.player_1_username || "Waiting for a winner";
          let player2Name = match.player_2_username || "Waiting for a winner";
          let avatarImg1 = match.player_1_avatar || "/assets/img/default-profile.jpg";
          let avatarImg2 = match.player_2_avatar || "/assets/img/default-profile.jpg";

          // Gérer l'affichage lorsque les joueurs ne sont pas encore déterminés
          if (player1Name === "Waiting for a winner") {
              avatarImg1 = ""; // Ne pas afficher d'avatar
          }
          if (player2Name === "Waiting for a winner") {
              avatarImg2 = ""; // Ne pas afficher d'avatar
          }

          if (this.#user.id === match.player_1_id || this.#user.id === match.player_2_id) {
              const isPlayer1 = this.#user.id === match.player_1_id;
              const isPlayer2 = this.#user.id === match.player_2_id;
              const buttonPlayer1 = isPlayer1 ? (match.player_1_ready ? 'Not Ready' : 'Prêt') : '';
              const buttonPlayer2 = isPlayer2 ? (match.player_2_ready ? 'Not Ready' : 'Prêt') : '';
              let readyIconPlayer1 = match.player_1_ready ? '<span class="icon-check" style="color:green;">✔</span>' : '<span class="icon-cross" style="color:red;">✖</span>';
              let readyIconPlayer2 = match.player_2_ready ? '<span class="icon-check" style="color:green;">✔</span>' : '<span class="icon-cross" style="color:red;">✖</span>';

              matchElement.innerHTML = `
                <div class="match-info">
                  <div class="player-info d-flex align-items-center">
                    ${avatarImg1 ? `<img src="${avatarImg1}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />` : ""}
                    <span class="player">${player1Name}</span>
                    ${isPlayer1 ? `<button id="ready-player1-${match.match_id}" class="ready-button">${buttonPlayer1}</button>` : readyIconPlayer1}
                  </div>
                  <div class="vs">vs</div>
                  <div class="player-info d-flex align-items-center">
                    ${avatarImg2 ? `<img src="${avatarImg2}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />` : ""}
                    <span class="player">${player2Name}</span>
                    ${isPlayer2 ? `<button id="ready-player2-${match.match_id}" class="ready-button">${buttonPlayer2}</button>` : readyIconPlayer2}
                  </div>
                  <br><br>
                </div>
                `;
          } else {
            matchElement.innerHTML = `
            <div class="match-info">
              <div class="player-info d-flex align-items-center">
                ${avatarImg1 ? `<img src="${avatarImg1}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />` : ""}
                <span class="player">${player1Name}</span>
              </div>
              <div class="vs">vs</div>
              <div class="player-info d-flex align-items-center">
                ${avatarImg2 ? `<img src="${avatarImg2}" class="object-fit-cover rounded-circle mr-2" width="28" height="28" />` : ""}
                <span class="player">${player2Name}</span>
              </div>
              <br><br>
            </div>
            `;
          }
          // Attacher un gestionnaire d'événements pour le bouton "Prêt" si visible
       if (this.#user.id === match.player_1_id) {
            const player1ReadyButton = matchElement.querySelector(`#ready-player1-${match.match_id}`);
            player1ReadyButton.addEventListener('click', () => this.handleReadyButtonClick(match.player_1_id));
        }
        if (this.#user.id === match.player_2_id) {
            const player2ReadyButton = matchElement.querySelector(`#ready-player2-${match.match_id}`);
            player2ReadyButton.addEventListener('click', () => this.handleReadyButtonClick(match.player_2_id));
        }
          tourElement.appendChild(matchElement);
      });
      if (tourIndex === totalTours - 1) {
        const finaleHeader = document.createElement('div');
        finaleHeader.style.display = 'flex';
        finaleHeader.style.alignItems = 'center'; // Centrer les éléments verticalement
        finaleHeader.appendChild(titleElement);

        const winnerContainer = document.createElement('div');
        winnerContainer.style.display = 'flex';
        winnerContainer.style.flexDirection = 'column'; // Empiler le titre "Winner" et le message verticalement
        winnerContainer.style.marginLeft = '150px'; // Pousser le conteneur à droite

        const winnerTitleElement = document.createElement('h3');
        winnerTitleElement.textContent = 'Winner';
        winnerContainer.appendChild(winnerTitleElement);

        const winnerMessageElement = document.createElement('div');
        let winnerMessage = "Waiting for result";
        const lastMatch = matches[matches.length - 1];
        if (lastMatch && lastMatch.winner) {
            winnerMessage = lastMatch.winner.username;
        }
        winnerMessageElement.innerHTML = `<h5>Winner: ${winnerMessage}</h5>`;
        winnerContainer.appendChild(winnerMessageElement);

        finaleHeader.appendChild(winnerContainer);
        tourElement.insertBefore(finaleHeader, tourElement.firstChild);
      }
      

      tournamentTabElement.appendChild(tourElement);
  });
}

  handleReadyButtonClick(playerId) {
    console.log(`Player ${playerId} is ready!`);
    // Ici, vous pourriez également appeler une fonction qui va envoyer cette information au backend
    fetch(`http://127.0.0.1:8005/tournament/ready/${playerId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Mettre à jour l'UI pour refléter le changement d'état
        console.log(`Player ${playerId} is now marked as ready in the backend.`);
        this.displayUpdate();
        if(data.match_started)
          console.log("matche commenceeeeee !!!!");
      } else {
        console.error('Could not mark the player as ready in the backend.', data.error);
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation: ' + error.message);
    });
  }
  
  async deletePlayer() {
    const data = await fetchDeletePlayerSalon();
  }
  
  async displayUpdate() {
    const matches = await fetchGetMatchs();
      console.log(matches);
      if (matches.success)
        this.displayMatches(matches.matches_by_tour);
      else 
        console.log("error : get matchs failled !");
  }
  
  async displayRounds() {
    const response = await fetch(`http://127.0.0.1:8005/tournament/get_next_rounds/${this.#tournament.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json();
  }

  // generateTournamentTab() {
  //   let message = ''; // Variable pour stocker le message à afficher

  //   switch (this.#tournament.maxPlayer) {
  //     case 4:
  //       return this.generateTournamentTab4();
  //     case 8:
  //       message = '8 Joueurs';
  //       break;
  //     case 12:
  //       message = '12 Joueurs';
  //       break;
  //     case 16:
  //       message = '16 Joueurs';
  //       break;
  //     default:
  //       message = 'Tournoi vide';
  //       break;
  //   }

  //   return message;
  // }

  // // Les cases des bracket avec le username personnalise
  // fakecardTournament(username) {
  //   const user = getProfile();
  //   return `
  //   <div class="card text-center mb-3" style="width: 18rem;">
  //     <div class="card-body">
  //       <h5 class="card-title">${username}</h5>
  //       <div class="d-flex justify-content-center">
  //         <img src="https://images.emojiterra.com/google/android-nougat/512px/2754.png" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 50%;" width="90" height="90" alt="${user.username}">
  //       </div>
  //     </div>
  //   </div>
  //   `;
  // }

  // // Les cases des bracket avec le username personnalise
  // cardTournament(player, TabUser) {
  //   const user = TabUser.find(item => item.id === player.user_id);

  //   console.log(user);

  //   let avatarSrc = user.avatar;

  //   if (user.avatar == null) 
  //   {
  //     if (user.avatar42 == null)
  //       avatarSrc = "https://oasys.ch/wp-content/uploads/2019/03/photo-avatar-profil.png";
  //     else
  //       avatarSrc = user.avatar42;
  //   }

  //   // console.log(user.getProfile.avatar);

  //   const thisIsMeReady = this.#user.id === player.user_id;
  //   const readyButton = thisIsMeReady ? `<a href="#" class="btn btn-primary mt-3">Ready</a>` : '<br><br>';

  //   return `
  //   <div class="card text-center mb-3" style="width: 18rem;">
  //     <div class="card-body">
  //       <h5 class="card-title">${player.username}</h5>
  //       <div class="d-flex justify-content-center">
  //         <img src="${avatarSrc}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 50%;" width="90" height="90" alt="${user.username}">
  //       </div>
  //       ${readyButton}
  //     </div>
  //   </div>
  //   `;
  // }

  // async generateTournamentTab4() {
  //   try {
  //     if (!this.#tournament.id) {
  //       throw new Error('Tournament ID is not defined');
  //     }

  //     // console.log('Tournament ID:', this.#tournament.id);

  //     /////////////////////////TAB PLAYER user_id username
  //     const response = await fetch(`http://127.0.0.1:8005/tournament/get_player/${this.#tournament.id}/`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //     });
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const players = await response.json();

  //     //////////////////// TAB USER id username avatar avatar42
  //     const TabUser = [];

  //     await Promise.all(
  //       players.map(async player => {
  //         const csrfToken = await getCsrfToken();
  //         const responseUser = await fetch(`http://127.0.0.1:8002/get_user_profile/${player.user_id}/`, {
  //           method: 'GET',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'X-CSRFToken': csrfToken,
  //           },
  //           credentials: 'include',
  //         });
  //         if (!responseUser.ok) {
  //           throw new Error(`HTTP error! status: ${responseUser.status}`);
  //         }

  //         const user = await responseUser.json();

  //         TabUser.push(user); // Ajout de l'utilisateur au tableau TabUser
  //       })
  //     );

  //     /////////////////// AFFICHE
  //     console.log('Players:', players);
  //     console.log('TabUser:', TabUser);

  //     const lastRowHtml =
  //       '<div class="row">' +
  //       players
  //         .map(
  //           player =>
  //             `<div class="col mt-4">
  //             ${this.cardTournament(player, TabUser)}
  //           </div>`
  //         )
  //         .join('') +
  //       '</div>';

  //     const listElement = this.querySelector('#tournamentTabFront');

  //     console.log(listElement);
  //     listElement.innerHTML = `
  //     <div>
  //       <div class="container text-center">
  //         <div class="row">
  //           <div class="col d-flex justify-content-center">
  //             <div id="tournamentTabMessage" class="mt-4">${this.fakecardTournament('...')}</div>
  //           </div>
  //         </div>
  //         <div class="row">
  //           <div class="col d-flex justify-content-center">
  //             <div id="tournamentTabMessage" class="mt-4">${this.fakecardTournament('...')}</div>
  //           </div>
  //           <div class="col d-flex justify-content-center">
  //             <div id="tournamentTabMessage" class="mt-4">${this.fakecardTournament('...')}</div>
  //           </div>
  //         </div>
  //         ${lastRowHtml}
  //       </div>
  //     </div>
  //     `;

  //     listElement.querySelectorAll('.btn.btn-primary').forEach(btn => {
  //       btn.addEventListener('click', () => {
  //         console.log('Ready button clicked');
  //         // redirectTo('/game/online');
  //       });
  //     });
  //     // players.forEach(player => {
  //     //   const playerElement = document.createElement('div');
  //     //   playerElement.innerHTML = `
  //     //       <div class="col"><div id="tournamentTabMessage" class="mt-4">${this.cardTournament(
  //     //         player.username
  //     //       )}</div></div>
  //     //     `;
  //     //   listElement.appendChild(playerElement);
  //     // });
  //   } catch (error) {
  //     console.error('Could not load tournament:', error);
    // }
  // }
}

customElements.define('view-game-tournament-start', ViewTournamentstart);
