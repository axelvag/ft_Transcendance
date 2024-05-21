import { getProfile } from '@/auth.js';
import { isAuthenticated } from '@/auth.js';
import {
  setLocalTournament,
  fetchGetTournament,
  fetchCreateTournament,
  fetchDeletePlayer,
  getTournament,
  fetchDeletePlayerAndTournament,
  fetchTournamentInfo,
} from '@/tournament.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { BASE_URL, WS_BASE_URL } from '@/constants.js';
import { redirectTo } from '../router';
import { showModal } from '@/modal.js';

class ViewTournament extends HTMLElement {
  #user;
  #tournament;
  constructor() {
    super();
    this.#user = getProfile();
    this.#tournament = getTournament();
  }
  async connectedCallback() {
    await fetchTournamentInfo();
    if (this.#tournament.status === 2) {
      await fetchDeletePlayerAndTournament();
      await fetchTournamentInfo();
      this.#tournament = getTournament();
    }
    if (this.#tournament.status === 1) {
      redirectTo(`/game/tournament/start`);
      return;
    }
    const isLoggedIn = await isAuthenticated();
    const backUrl = isLoggedIn ? '/game' : '/';

    this.innerHTML = `
    <div class="min-vh-100 halo-bicolor d-flex flex-column p-2">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div class="d-flex">
          <a href="#" data-link="${backUrl}" class="d-inline-block link-body-emphasis link-opacity-75 link-opacity-100-hover fs-4 m-3" title="back">
            <ui-icon name="arrow-up" rotate="-90" class="me-2"></ui-icon>
          </a>
        </div>
        <h1 class="fw-bold text-center m-0">Tournament</h1>
        <div class="d-grid">
          <button id="createTournamentBtn" class="btn btn-outline-primary border-2 fw-semibold rounded-0" style="--bs-btn-color: var(--bs-body-color);">
            <span class="d-inline-block py-1">Create a Tournament</span>
          </button>
        </div>
        </div>
        <div id="tournoisList" class="mt-4"></div>
      <div id="formOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0); z-index: 2;">
      <auth-layout>
        <form id="tournamentForm">
            <div id="closeForm" style="cursor: pointer; font-size: 24px;">✕</div>  
            <h1 class="fw-bold py-2 mb-4">
              <span class="text-bicolor">Create Tournament</span>
            </h1>
              <div class="mb-4">
              <label class="form-label" for="tournamentName">
              Tournament Name
              </label>
              <input
                class="form-control form-control-lg"
                type="tournamentName"
                id="tournamentName"
                name="tournamentName"
                required
                autocomplete="Tournament Name"
              />
              <div id="emtournamentName-error" class="invalid-feedback"></div>
            </div>
              <div class="mb-4">
                <label class="form-label" for="tournamentSize">
                Tournament Size
                </label>
                <br>
                  <input type="range" id="tournamentSizeRange" name="tournamentSize" min="4" max="8" value="8" step="4" />
                  <span id="tournamentSizeValue">8</span>
                <div id="tournamentSize-error" class="invalid-feedback"></div>
              </div>
              <div class="d-grid pt-3">
                <button type="submit" class="btn btn-primary btn-lg fw-bold">
                  Create Tournament
                </button>
              </div>
            </form>
        </auth-layout>
      </div>
    </div>
    `;

    this.tournamentName = document.getElementById('tournamentName');
    this.tournamentSizeValue = document.getElementById('tournamentSizeValue');

    // Attache les gestionnaires d'événements
    this.querySelector('#createTournamentBtn').addEventListener('click', () => {
      this.querySelector('#formOverlay').style.display = 'block';
    });

    this.querySelector('#closeForm').addEventListener('click', e => {
      e.preventDefault(); // Prévenir le rechargement de la page sur soumission
      this.querySelector('#formOverlay').style.display = 'none';
    });

    // Mettre à jour dynamiquement la valeur sélectionnée du curseur range
    const tournamentSizeRangeInput = this.querySelector('#tournamentSizeRange');
    const tournamentSizeValueDisplay = this.querySelector('#tournamentSizeValue');

    // Mettre à jour directement au chargement de la page
    tournamentSizeValueDisplay.textContent = tournamentSizeRangeInput.value;

    tournamentSizeRangeInput.addEventListener('input', function () {
      tournamentSizeValueDisplay.textContent = this.value;
    });

    this.querySelector('#tournoisList').addEventListener('click', async event => {
      if (event.target.classList.contains('joinTournamentBtn')) {
        const tournamentId = event.target.id.replace('joinTournament-', '');
        if (this.#tournament.id !== null && this.#tournament.id.toString() !== tournamentId) {
          showModal(
            'You are already in a tournament. ',
            'If you join this tournament, you will be disconnected from the other. Do you want to continue ?',
            {
              okCallback: async () => {
                await fetchDeletePlayer();
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                  this.socket.close();
                }
                fetchGetTournament(tournamentId);
              },
              cancelCallback: () => {
                return;
              },
            }
          );
        } else {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
          }
          fetchGetTournament(tournamentId);
        }
      }
    });

    this.loadTournois();

    this.querySelector('#tournamentForm').addEventListener('submit', this.submitForm.bind(this));

    this.initWebSocket();
    this.querySelector('a[data-link]').addEventListener('click', e => {
      e.preventDefault();

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
    });
  }

  disconnectedCallback() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  async submitForm(event) {
    event.preventDefault();

    // const csrfToken = await getCsrfToken();

    if (this.#tournament.id !== null) {
      showModal(
        'You are already in a tournament. ',
        'If you create this tournament, you will be disconnected from the other. Do you want to continue ?',
        {
          okCallback: async () => {
            await fetchDeletePlayer();
            this.tournamentName = document.getElementById('tournamentName');
            this.tournamentSizeValue = document.getElementById('tournamentSizeValue');

            const formData = {
              tournamentName: this.tournamentName.value,
              tournamentSize: parseInt(this.tournamentSizeValue.textContent, 10), // Notez le changement ici pour utiliser textContent
              admin_id: this.#user.id,
            };
            const data = await fetchCreateTournament(formData);
            if (data.success) {
              this.querySelector('#formOverlay').style.display = 'none';
              if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.close();
              }
              fetchGetTournament(data.tournoi_id);
            }
          },
          cancelCallback: () => {
            return;
          },
        }
      );
    } else {
      this.tournamentName = document.getElementById('tournamentName');
      this.tournamentSizeValue = document.getElementById('tournamentSizeValue');

      const formData = {
        tournamentName: this.tournamentName.value,
        tournamentSize: parseInt(this.tournamentSizeValue.textContent, 10), // Notez le changement ici pour utiliser textContent
        admin_id: this.#user.id,
      };
      const data = await fetchCreateTournament(formData);
      if (data.success) {
        this.querySelector('#formOverlay').style.display = 'none';
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
        fetchGetTournament(data.tournoi_id);
      }
    }
  }

  async loadTournois() {
    try {
      await fetchTournamentInfo();
      this.#tournament = getTournament();
      if (this.#tournament.status === 1) {
        redirectTo(`/game/tournament/start`);
        return;
      }
      const response = await fetch(BASE_URL + ':8005/tournament/view/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tournois = await response.json();
      const listElement = this.querySelector('#tournoisList');
      listElement.innerHTML = '<h2>Join a Tournaments</h2><br>'; // Titre pour la section

      tournois.forEach(tournoi => {
        const tournoiElement = document.createElement('div');
        let isInTournamentMessage = '';

        if (this.#tournament.id === tournoi.id) {
          // Si l'utilisateur est déjà dans ce tournoi, afficher un message en rouge
          isInTournamentMessage = '<p style="color: red;">You are in this tournament</p>';
        }

        // Construction du HTML de chaque tournoi
        let adminInfo = tournoi.admin_username ? `<p>Create by: ${tournoi.admin_username}</p>` : '';
        tournoiElement.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; flex-direction: column;">
                      <h3>${tournoi.name}</h3>
                      ${isInTournamentMessage}
                      <div style="display: flex;">
                          <p style="margin-right: 10px;">Players: ${tournoi.nombre_joueurs} / ${tournoi.max_players}</p>
                          ${adminInfo}
                      </div>
                  </div>
                  ${
                    tournoi.nombre_joueurs < tournoi.max_players
                      ? `<button id="joinTournament-${tournoi.id}" class="joinTournamentBtn">Join Tournament</button>`
                      : ''
                  }
              </div>
              <hr style="border-top: 1px solid #ccc; margin: 10px 0;">
          `;

        listElement.appendChild(tournoiElement);
      });
    } catch (error) {
      console.error('Could not load tournament:', error);
    }
  }

  initWebSocket() {
    // Assurez-vous que l'URL correspond à votre serveur WebSocket.
    this.socket = new WebSocket(WS_BASE_URL + ':8005/tournament/websocket/');

    this.socket.onopen = () => {};

    this.socket.onmessage = event => {
      // Logique pour gérer les messages entrants.
      const data = JSON.parse(event.data);

      if (data.action === 'reload_tournois') {
        this.loadTournois();
      }
    };

    this.socket.onclose = () => {};

    this.socket.onerror = error => {
      console.error('WebSocket error:', error);
    };
  }
}

customElements.define('view-game-tournament', ViewTournament);
