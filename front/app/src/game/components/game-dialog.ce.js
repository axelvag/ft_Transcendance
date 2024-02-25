import './game-dialog.ce.scss';
import './game-player.ce.js';

class GameDialog extends HTMLElement {
  constructor() {
    super();

    this.render = this.render.bind(this);
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="gameDialog">
        <div class="gameDialog-players">
          <game-player class="gameDialog-player is-left"></game-player>
          <div class="gameDialog-players-separator text-bicolor">vs</div>
          <game-player class="gameDialog-player is-right"></game-player>
        </div>
        <div class="gameDialog-wrapper">
          <div class="gameDialog-content">
            <div class="gameDialog-title"></div>
            <div class="gameDialog-controls"></div>
          </div>
        </div>
      </div>
    `;
  }

  disconnectedCallback() {}

  renderPlayers(players, winner) {
    this.playerLeftEl = this.querySelector('.gameDialog-player.is-left');
    if (this.playerLeftEl) {
      this.playerLeftEl.setAttribute('name', players?.playerLeft?.name);
      this.playerLeftEl.setAttribute('avatar', players?.playerLeft?.avatar);
      if (winner === 'left') {
        this.playerLeftEl.setAttribute('winner', true);
      } else {
        this.playerLeftEl.removeAttribute('winner');
      }
    }

    this.playerRightEl = this.querySelector('.gameDialog-player.is-right');
    if (this.playerLeftEl) {
      this.playerRightEl.setAttribute('name', players?.playerRight?.name);
      this.playerRightEl.setAttribute('avatar', players?.playerRight?.avatar);
      this.playerRightEl.setAttribute('direction', 'right');
      if (winner === 'right') {
        this.playerRightEl.setAttribute('winner', true);
      } else {
        this.playerRightEl.removeAttribute('winner');
      }
    }

    this.querySelector('.gameDialog-players').hidden = !players;
  }

  renderControls(controls = []) {
    const controlListEl = this.querySelector('.gameDialog-controls');
    controlListEl.innerHTML = '';
    controls.forEach(control => {
      const btnEl = document.createElement('button');
      btnEl.classList.add('gameDialog-btn');
      if (control.large) btnEl.classList.add('is-lg');
      btnEl.innerHTML = `<ui-icon name="${control.icon}" ${control.large ? 'scale="1.25"' : ''}></ui-icon>`;
      btnEl.addEventListener('click', control.action);
      controlListEl.appendChild(btnEl);
    });
  }

  render(params = {}) {
    this.renderPlayers(params.players, params.winner);
    this.querySelector('.gameDialog-title').textContent = params.title;
    this.renderControls(params.controls);
    this.hidden = !params.open;
  }
}

customElements.define('game-dialog', GameDialog);
