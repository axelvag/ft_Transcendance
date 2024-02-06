import { characters } from './localApi/characters.js';
import { redirectTo } from '../router.js';

const template = () => {
  const optionsHtml = selectedId => {
    return characters
      .map(c => {
        const selectedAttr = selectedId === c.id ? 'selected' : '';
        return `<option value="${c.id}" ${selectedAttr}>${c.name}</option>`;
      })
      .join('');
  };
  return `
    <div class="container-fluid" style="max-width: 520px;">
      <div class="py-5">
        <h1 class="text-gradient fw-bold pb-3">New Game</h1>

        <!-- Mode -->
        <div class="mb-4" id="modeField">
          <div class="mb-1">
            <label class="form-label">Mode</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="mode" id="modeOffline" value="offline" checked>
            <label class="form-check-label" for="modeOffline">Offline</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="mode" id="modeOnline" value="online">
            <label class="form-check-label" for="modeOnline">Online</label>
          </div>
        </div>

        <!-- Offline -->
        <div id="modeOfflineFieldset" hidden>
          <!-- Player left -->
          <div class="mb-4">
            <div class="mb-1">
              <label class="form-label">Player 1</label>
            </div>
            <select class="form-select" name="player1">
              ${optionsHtml('ryu')}
            </select>
          </div>

          <!-- Player right -->
          <div class="mb-4">
            <div class="mb-1">
              <label class="form-label">Player 2</label>
            </div>
            <select class="form-select" name="player2">
              ${optionsHtml('ken')}
            </select>
          </div>

          <!-- Start -->
          <div class="d-grid pt-3">
            <button class="btn btn-primary" id="playOfflineBtn">Start</button>
          </div>
        </div>


        <!-- Online -->
        <div id="modeOnlineFieldset" hidden>
          <p>Wait for a player...</p>
        </div>
        
    </div>
  `;
};

class ViewGameNew extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = template();

    // Mode change
    this.onModeChange();
    this.querySelector('#modeField').addEventListener('input', this.onModeChange.bind(this));
    this.querySelector('#playOfflineBtn').addEventListener('click', this.onPlayOffline.bind(this));
  }

  onModeChange() {
    const modeValue = this.querySelector('[name="mode"]:checked').value;
    this.querySelector('#modeOnlineFieldset').hidden = modeValue !== 'online';
    this.querySelector('#modeOfflineFieldset').hidden = modeValue !== 'offline';
  }

  onPlayOffline() {
    redirectTo('/game/play', {
      query: {
        mode: 'offline',
        player1: this.querySelector('[name="player1"]').value,
        player2: this.querySelector('[name="player2"]').value,
      },
    });
  }
}

customElements.define('view-game-new', ViewGameNew);
