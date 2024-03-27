// import { user } from '@/auth.js';
// import { getProfile } from '@/auth.js';
// import { isAuthenticated } from '@/auth.js';

// class ViewTournament extends HTMLElement {
//   async connectedCallback() {
//     const isLoggedIn = await isAuthenticated();
//     const backUrl = isLoggedIn ? '/game' : '/';

//     this.innerHTML = `
//     <div class="min-vh-100 halo-bicolor d-flex flex-column p-2">
//       <div class="d-flex justify-content-between align-items-center mb-5">
//         <div class="d-flex">
//           <a href="#" data-link="${backUrl}" class="d-inline-block link-body-emphasis link-opacity-75 link-opacity-100-hover fs-4 m-3" title="back">
//             <ui-icon name="arrow-up" rotate="-90" class="me-2"></ui-icon>
//           </a>
//         </div>
//         <h1 class="fw-bold text-center m-0">Tournament</h1>
//         <div class="d-grid">
//           <a class="btn btn-outline-primary border-2 fw-semibold rounded-0" style="--bs-btn-color: var(--bs-body-color);" href="#" data-link="">
//             <span class="d-inline-block py-1">Create a Tournament</span>
//           </a>
//         </div>
//       </div>
//     </div>
//     `;
//   }
// }

// customElements.define('view-game-tournament', ViewTournament);

import { user } from '@/auth.js';
import { getProfile } from '@/auth.js';
import { isAuthenticated } from '@/auth.js';
import '@/components/layouts/auth-layout/auth-layout.ce.js';

class ViewTournament extends HTMLElement {
  async connectedCallback() {
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
                  <input type="range" id="tournamentSizeRange" name="tournamentSize" min="4" max="16" value="8" step="4" />
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

    this.querySelector('#closeForm').addEventListener('click', (e) => {
      e.preventDefault(); // Prévenir le rechargement de la page sur soumission
      this.querySelector('#formOverlay').style.display = 'none';
    });

    // Mettre à jour dynamiquement la valeur sélectionnée du curseur range
    const tournamentSizeRangeInput = this.querySelector('#tournamentSizeRange');
    const tournamentSizeValueDisplay = this.querySelector('#tournamentSizeValue');

    // Mettre à jour directement au chargement de la page
    tournamentSizeValueDisplay.textContent = tournamentSizeRangeInput.value;

    tournamentSizeRangeInput.addEventListener('input', function() {
      tournamentSizeValueDisplay.textContent = this.value;
    });

    this.querySelector('#tournamentForm').addEventListener('submit', this.submitForm.bind(this));
  }

  async submitForm(event) {
    event.preventDefault();

    // Ajout : Récupération du CSRF Token
    // const csrfToken = await getCsrfToken();

    this.tournamentName = document.getElementById('tournamentName');
    this.tournamentSizeValue = document.getElementById('tournamentSizeValue');

    const formData = {
      tournamentName: this.tournamentName.value,
      tournamentSize: parseInt(this.tournamentSizeValue.textContent, 10), // Notez le changement ici pour utiliser textContent
    };
    console.log(formData);
    const response = await fetch('http://127.0.0.1:8005/tournament/create_tournament/', {
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
    } else {
      console.log(data);
    }
  }
}

customElements.define('view-game-tournament', ViewTournament);

