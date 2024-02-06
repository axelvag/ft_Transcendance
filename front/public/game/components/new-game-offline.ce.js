import { characters } from '../localApi/characters.js';
import { redirectTo } from '../../router.js';

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
      <button class="btn btn-primary" id="startBtn">Start</button>
    </div>
  `;
};

class NewGameOffline extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template();
    this.querySelector('#startBtn').addEventListener('click', this.onStart.bind(this));
  }

  onStart() {
    redirectTo('/game/play', {
      query: {
        mode: 'offline',
        player1: this.querySelector('[name="player1"]').value,
        player2: this.querySelector('[name="player2"]').value,
      },
    });
  }
}

customElements.define('new-game-offline', NewGameOffline);
