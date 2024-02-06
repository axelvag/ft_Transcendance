import './components/new-game-offline.ce.js';
import './components/new-game-online.ce.js';

const template = `
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

        <div id="selectedModeContent"></div>

    </div>
`;

class ViewGameNew extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    // Mode change
    this.onModeChange();
    this.querySelector('#modeField').addEventListener('input', this.onModeChange.bind(this));
  }

  onModeChange() {
    const modeValue = this.querySelector('[name="mode"]:checked').value;
    if (modeValue === 'offline') {
      this.querySelector('#selectedModeContent').innerHTML = '<new-game-offline></new-game-offline>';
    } else if (modeValue === 'online') {
      this.querySelector('#selectedModeContent').innerHTML = '<new-game-online></new-game-online>';
    } else {
      this.querySelector('#selectedModeContent').innerHTML = '';
    }
  }
}

customElements.define('view-game-new', ViewGameNew);
