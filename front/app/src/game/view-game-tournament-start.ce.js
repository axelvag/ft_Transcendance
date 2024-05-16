import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import {
  getTournament,
  fetchCreateMatchs,
  fetchGetMatchs,
  fetchInfoMatch,
  getMatch,
  fetchDeletePlayerAndTournament,
  fetchLeaveMatch,
  fetchLeaveMatchAlone,
  updateWinnerLeave,
  fetchUserNobodyReadyTime,
  fetchUserOneReadyTime,
  fetchTournamentInfo,
} from '@/tournament.js';
import { isAuthenticated } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '@/router.js';
import { BASE_URL, WS_BASE_URL } from '@/constants.js';

class ViewTournamentstart extends HTMLElement {
  #user;
  #tournament;
  #match
  #backUrl = '/'; // Définissez ici l'URL de redirection par défaut

  constructor() {
    super();
    this.#user = getProfile();
    this.#tournament = getTournament();
  }

  async connectedCallback() {
    const isLoggedIn = await isAuthenticated();
    // Modifiez l'URL de redirection en fonction de l'état de connexion
    this.#backUrl = isLoggedIn ? '/game/tournament' : '/';
    if(this.#tournament.id === null){
      redirectTo(this.#backUrl);
      return;
    }

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
    this.querySelector('#leaveTournamentBtn').addEventListener('click', async () => {
        await this.infoMatch();
        this.#match = getMatch();
        if(this.#match.status !== 2)
        {
          if(this.#match.player1id !== "" && this.#match.player2id !== "")
            await this.UserLeave();
          else
            await this.UserLeaveAlone();
        }
        await this.deletePlayer();
    });

    this.initWebSocket();
    if (this.#tournament.status === 0)
      await this.createMatchs();
    else{
      this.displayUpdate();
    }
  }

  async disconnectedCallback() {

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  async createMatchs() {
    const data = await fetchCreateMatchs();
    if (data.success) {
      await fetchTournamentInfo();
      await this.infoMatch();
      const matches = await fetchGetMatchs();
      if (matches.success)
        this.displayMatches(matches.matches_by_tour);
      else
        console.log("error : get matchs failled !");
    } else {
      console.log("error : create matchs failled !");
    }
  }

  displayMatches(matchesByTour) {
    console.log("dsplay match");
    this.#match = getMatch();
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
          
          let player1Name = match.player_1_username || "...";
          let player2Name = match.player_2_username || "...";
          let avatarImg1 = match.player_1_avatar || "/assets/img/default-profile.jpg";
          let avatarImg2 = match.player_2_avatar || "/assets/img/default-profile.jpg";
          
          // Gérer l'affichage lorsque les joueurs ne sont pas encore déterminés
          if (player1Name === "...") {
            avatarImg1 = ""; // Ne pas afficher d'avatar
          }
          if (player2Name === "...") {
            avatarImg2 = ""; // Ne pas afficher d'avatar
          }

          // Les joueurs ne ce mettent pas READY donc on lance un chrono
          if (!this.#match.player1ready || !this.#match.player2ready) {
            this.startChronoIfNotReady(match.match_id, player1Name, player2Name);
          }
          
          if(this.#match.id === match.match_id && match.status != 2) {
              const isPlayer1 = this.#user.id === match.player_1_id;
              const isPlayer2 = this.#user.id === match.player_2_id;
              const buttonPlayer1 = isPlayer1 ? (match.player_1_ready ? 'Not Ready' : 'Play') : '';
              const buttonPlayer2 = isPlayer2 ? (match.player_2_ready ? 'Not Ready' : 'Play') : '';
              let readyIconPlayer1 = match.player_1_ready ? '<span class="icon-check" style="color:green;">✔</span>' : '<span class="icon-cross" style="color:red;">✖</span>';
              let readyIconPlayer2 = match.player_2_ready ? '<span class="icon-check" style="color:green;">✔</span>' : '<span class="icon-cross" style="color:red;">✖</span>';
              // si on est en final -> tourIndex === totalTours - 1
              let vsElement = tourIndex === totalTours - 1 ? `<div class=" vs mx-4 fs-4 text-center">vs</div>` : `<div class="vs mx-4 fs-4 text-center">vs</div>`;
              let SpaceDownBracketFinal = tourIndex === totalTours - 1 ? `<br><br><br><br>` : "";
              // Le bracket ou le joueur vas jouer
              matchElement.innerHTML = `
                  ${SpaceDownBracketFinal}
                  <div class="match-info">
                    <div class="player-info card text-center" style="width: 18rem; height: 6rem; border: 2px solid white;">
                      <div class="card-body d-flex align-items-center">
                        <div class="col-3">
                          ${avatarImg1 ? `<img src="${avatarImg1}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 100%;" width="90" height="90" alt="${player1Name}">` : ""}
                        </div>
                        <div class="col-6">
                          <h5 class="card-title">${player1Name}</h5>
                        </div>
                        <div class="col-3 mb-2">
                          ${(isPlayer1 && this.#match.player1id !== "" && this.#match.player2id !== "" ) ? `<button id="ready-player1-${match.match_id}" class="ready-button">${buttonPlayer1}</button>` : ((this.#match.player1id !== "" && this.#match.player2id !== "") ? readyIconPlayer1 : "")}
                        </div>
                      </div>
                    </div>
                    ${vsElement}
                    <div class="player-info card text-center" style="width: 18rem; height: 6rem; border: 2px solid white;">
                      <div class="card-body d-flex align-items-center">
                        <div class="col-3">
                          ${avatarImg2 ? `<img src="${avatarImg2}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 100%;" width="90" height="90" alt="${player2Name}">` : ""}
                        </div>
                        <div class="col-6">
                          <h5 class="card-title">${player2Name}</h5>
                        </div>
                        <div class="col-3 mb-2">
                          ${(isPlayer2 && this.#match.player1id !== "" && this.#match.player2id !== "" )? `<button id="ready-player2-${match.match_id}" class="ready-button">${buttonPlayer2}</button>` : ((this.#match.player1id !== "" && this.#match.player2id !== "") ? readyIconPlayer2 : "")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <br><br>
                `;
          } 
          else if (match.status === 2) {
            // Vérifier si aucun joueur n'a atteint un score de 5
            const forfeit = match.player_1_score < 5 && match.player_2_score < 5;
            const player1BoxStyle = match.winner_id === player1Name ? 'background-color:green;' : (forfeit && match.winner_id !== player1Name ? 'background-color:gray;' : 'background-color:red;');
            const player2BoxStyle = match.winner_id === player2Name ? 'background-color:green;' : (forfeit && match.winner_id !== player2Name ? 'background-color:gray;' : 'background-color:red;');
            const player1Text = forfeit && match.winner_id !== player1Name ? 'Forfait' : match.player_1_score;
            const player2Text = forfeit && match.winner_id !== player2Name ? 'Forfait' : match.player_2_score;
        
            let vsElement = tourIndex === totalTours - 1 ? `<div class="vs mx-4 fs-4 text-center">vs</div>` : `<div class="vs mx-4 fs-4 text-center">vs</div>`;
            let SpaceDownBracketFinal = tourIndex === totalTours - 1 ? `<br><br><br><br>` : "";
        
            matchElement.innerHTML = `
            ${SpaceDownBracketFinal}
              <div class="match-info">
                <div class="player-info card text-center" style="width: 18rem; height: 6rem; border: 2px solid white;">
                  <div class="card-body d-flex align-items-center">
                    <div class="col-3">
                      ${avatarImg1 ? `<img src="${avatarImg1}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 100%;" width="90" height="90" alt="${player1Name}">` : ""}
                    </div>
                    <div class="col-6">
                      <h5 class="card-title" ">${player1Name}</h5>
                    </div>
                    <div class="col-3 d-flex justify-content-end">
                      <div class="score-box text-center text-white" style="border: 1px solid black; padding: 0 10px; border-radius: 5px; ${player1BoxStyle}">
                        ${player1Text}
                      </div>
                    </div>
                  </div>
                </div>
                ${vsElement}
                <div class="player-info card text-center" style="width: 18rem; height: 6rem; border: 2px solid white;">
                  <div class="card-body d-flex align-items-center">
                    <div class="col-3">
                      ${avatarImg2 ? `<img src="${avatarImg2}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 100%;" width="90" height="90" alt="${player2Name}">` : ""}
                    </div>
                    <div class="col-6">
                      <h5 class="card-title" ">${player2Name}</h5>
                    </div>
                    <div class="col-3 d-flex justify-content-end">
                      <div class="score-box text-center text-white" style="border: 1px solid black; padding: 0 10px; border-radius: 5px; ${player2BoxStyle}">
                        ${player2Text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <br><br>
            `;
        }        
          // Les brackets pas encores faits ou des autres
          else {
            let vsElement = tourIndex === totalTours - 1 ? `<div class=" vs mx-4 fs-4 text-center">vs</div>` : `<div class="vs mx-4 fs-4 text-center">vs</div>`;
            let SpaceDownBracketFinal = tourIndex === totalTours - 1 ? `<br><br><br><br>` : "";
            matchElement.innerHTML = `
              ${SpaceDownBracketFinal}
              <div class="match-info">
                <div class="player-info card text-center" style="width: 18rem; height: 6rem; border: 2px solid white;">
                  <div class="card-body d-flex align-items-center">
                    <div class="col-3">
                      ${avatarImg1 ? `<img src="${avatarImg1}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 100%;" width="90" height="90" alt="${player1Name}">` : ""}
                    </div>
                    <div class="col-6">
                      <h5 class="card-title">${player1Name}</h5>
                    </div>
                  </div>
                </div>
                ${vsElement}
                <div class="player-info card text-center" style="width: 18rem; height: 6rem; border: 2px solid white;">
                  <div class="card-body d-flex align-items-center">
                    <div class="col-3">
                      ${avatarImg2 ? `<img src="${avatarImg2}" class="card-img-top img-fluid rounded-circle m-n1" style="max-width: 100%;" width="90" height="90" alt="${player2Name}">` : ""}
                    </div>
                    <div class="col-6">
                      <h5 class="card-title">${player2Name}</h5>
                    </div>
                  </div>
                </div>
                <br><br>
              </div>
            `;
          }
          // Attacher un gestionnaire d'événements pour le bouton "Prêt" si visible
       if (this.#match.id === match.match_id && this.#user.id === match.player_1_id && match.status != 2 && this.#match.player1id !== "" && this.#match.player2id !== "") {
            const player1ReadyButton = matchElement.querySelector(`#ready-player1-${match.match_id}`);
            player1ReadyButton.addEventListener('click', () => this.handleReadyButtonClick(match.player_1_id));
        }
        if (this.#match.id === match.match_id && this.#user.id === match.player_2_id && match.status != 2 && this.#match.player1id !== "" && this.#match.player2id !== "") {
            const player2ReadyButton = matchElement.querySelector(`#ready-player2-${match.match_id}`);
            player2ReadyButton.addEventListener('click', () => this.handleReadyButtonClick(match.player_2_id));
        }
        tourElement.appendChild(matchElement);
      });
      if (tourIndex === totalTours - 1) {
        // Ajouter le `tourElement` courant à `tournamentTabElement`
        tournamentTabElement.appendChild(tourElement);
    
        // Créer un nouveau `tourElement` pour `finaleHeader`
        const finalTourElement = document.createElement('div');
        finalTourElement.classList.add('tour');
        finalTourElement.style.display = 'flex';
        finalTourElement.style.flexDirection = 'column'; // Alignement vertical des éléments dans ce tour
        finalTourElement.style.marginRight = '150px'; // Espacement entre les tours
    
        // Créer le `finaleHeader`
        const finaleHeader = document.createElement('div');
        finaleHeader.style.display = 'flex';
        finaleHeader.style.alignItems = 'flex-start';
    
        const winnerContainer = document.createElement('div');
        winnerContainer.style.display = 'flex';
        winnerContainer.style.flexDirection = 'column'; // Empiler les éléments verticalement
    
        const winnerTitleElement = document.createElement('h3');
        winnerTitleElement.textContent = 'Winner';
        winnerContainer.appendChild(winnerTitleElement);
    
        finaleHeader.appendChild(winnerContainer);
    
        
        // Ajouter `finaleHeader` à `finalTourElement`
        finalTourElement.appendChild(finaleHeader);

        // Ajouter l'avatar du gagnant
        const lastMatch = matches[matches.length - 1];
        if (lastMatch && lastMatch.winner_id && tourIndex === totalTours - 1) {
          const winnerAvatar = document.createElement('p');
          let winnerAvatarPath = "/assets/img/default-profile.jpg";
          if (lastMatch.winner_id === lastMatch.player_1_username) {
            winnerAvatarPath = lastMatch.player_1_avatar;
          }
          else if (lastMatch.winner_id === lastMatch.player_2_username) {
            winnerAvatarPath = lastMatch.player_2_avatar;
          }
          if(winnerAvatarPath === null)
            winnerAvatarPath = "/assets/img/default-profile.jpg";
          winnerAvatar.innerHTML = `
              <br><br><br><br>
              <h3 class="text-center mb-3">${lastMatch.winner_id}</h3>
              <img src="${winnerAvatarPath}" class="img-fluid rounded-circle m-n1" style="max-width: 100%; width: 200px; height: 200px; position:absolute;z-index:2" alt="Winner Avatar">
              <img src="/assets/img/winner.png" class="img-fluid rounded-circle m-n1" style="max-width: 100%; width: 200px; height: 200px; position:absolute;z-index:2" alt="Winner Avatar">
              `;
          finalTourElement.appendChild(winnerAvatar);
        }
    
        // Ajouter `finalTourElement` à `tournamentTabElement`
        tournamentTabElement.appendChild(finalTourElement);
        
    }
    if (tourIndex !== totalTours - 1) 
      tournamentTabElement.appendChild(tourElement);
    });
  }

  async handleReadyButtonClick(playerId) {

    try {
      const response = await fetch(`${BASE_URL}:8005/tournament/ready/${playerId}/${this.#match.id}/`, {
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
        redirectTo(`/game/online/${data.game_id}/${this.#tournament.id}`);
      } else {
        console.error('Could not mark the player as ready in the backend.', data.error);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation: ' + error.message);
    }
  }


  async deletePlayer() {
    await fetchDeletePlayerAndTournament();
    redirectTo(this.#backUrl);
  }
  
  async displayUpdate() {
    await this.infoMatch();
    this.#match = getMatch();
    if(this.#match.status === 0 && this.#match.leave !== 0){
      await updateWinnerLeave();
      return;
    }
    const matches = await fetchGetMatchs();
      if (matches.success)
        this.displayMatches(matches.matches_by_tour);
  }

  async infoMatch() {
    await fetchInfoMatch();
  }

  async UserLeave() {
    const winner = await fetchLeaveMatch();  // Assurez-vous que fetchWinnerMatch est également une fonction async
  }
  
  async UserLeaveAlone() {
    const data = await fetchLeaveMatchAlone();  // Assurez-vous que fetchWinnerMatch est également une fonction async
  }

  async UserNobodyReadyTime() {
    const data = await fetchUserNobodyReadyTime();
  }

  async UserOneReadyTime(winnerId) {
    const data = await fetchUserOneReadyTime(winnerId);
  }

  startChronoIfNotReady(matchId, player1Name, player2Name) {
    if (this.#match.id !== matchId || this.#match.status === 2 || this.#match.player1id === "" || this.#match.player2id === "") {
      return;
    }
    
    const matchTemp = this.#match.id;
    const tournamentTemp = this.#tournament.id;
    const chronoTimeout = setTimeout(async () => {
      await fetchTournamentInfo();
      this.#tournament = getTournament();
      if (this.#tournament.id !== tournamentTemp || this.#tournament.status === 2 || this.#tournament.id === null)
        return;
      // A la fin du chrono, on met les joueurs READY de force
      console.log("get last match", this.#tournament);
      await this.infoMatch();
      this.#match = getMatch();
      if (this.#tournament.status === 2 || this.#tournament.id === null || this.#match.id === null || this.#match.id !== matchTemp || this.#match.player1id === "" || this.#match.player2id === "") {
        return;
      }
      if (this.#match.status === 2 || this.#match.status === 1) {
        return;
      }
      if (this.#match.player1ready === 0 && this.#match.player2ready === 0) {
        this.UserNobodyReadyTime();
      }
      if (this.#match.player1ready === 0 && this.#match.player2ready === 1 && this.#match.player1id === this.#user.id) {
        await this.handleReadyButtonClick(this.#match.player1id);
      }
      else if (this.#match.player2ready === 0 && this.#match.player1ready === 1 && this.#match.player2id === this.#user.id) {
        await this.handleReadyButtonClick(this.#match.player2id);
      }
    }, 60000); // 60 secondes
  }

  initWebSocket() {
    // Assurez-vous que l'URL correspond à votre serveur WebSocket.
    this.socket = new WebSocket(WS_BASE_URL + ':8005/tournament/websocket/');

    this.socket.onopen = () => {
      // console.log('WebSocket connection established start tournament');
      this.socket.send(JSON.stringify({ tournoi_id: this.#tournament.id }));
    };

    this.socket.onmessage = async (event) => {
        // Logique pour gérer les messages entrants.
        const data = JSON.parse(event.data);

        if (data.action === 'player_ready') {
          await this.displayUpdate();
        }
        if (data.action === 'winner') {
          await this.infoMatch();
          await this.displayUpdate();
        }
    };

    this.socket.onclose = async () => {
        // console.log('WebSocket connection closedd');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    window.addEventListener('beforeunload', () => {
      this.socket.close();
    });
  }
}

customElements.define('view-game-tournament-start', ViewTournamentstart);
