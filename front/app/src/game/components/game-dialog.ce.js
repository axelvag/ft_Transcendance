import './game-dialog.ce.scss';
import './game-player.ce.js';
import { enterFullscreen, exitFullscreen } from '@/fullscreen.js';
import { selectTheme } from '@/theme.js';

class GameDialog extends HTMLElement {
  constructor() {
    super();

    this.render = this.render.bind(this);
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="gameDialog">
        <div class="gameDialog-nav">

          <!-- Back -->
          <button class="gameDialog-nav-item gameDialog-back" hidden>
            <ui-icon name="arrow-left"></ui-icon>
          </button>

          <!-- Spacer -->
          <div class="gameDialog-nav-spacer"></div>

          <!-- Theme -->
          <button class="gameDialog-nav-item dark-hidden gameDialog-theme-dark">
            <ui-icon name="sun"></ui-icon>
          </button>
          <button class="gameDialog-nav-item dark-visible gameDialog-theme-light">
            <ui-icon name="moon"></ui-icon>
          </button>

          <!-- Fullscreen -->
          <button class="gameDialog-nav-item fullscreen-hidden gameDialog-enterFullscreen">
            <ui-icon name="expand"></ui-icon>
          </button>
          <button class="gameDialog-nav-item fullscreen-visible gameDialog-exitFullscreen">    
            <ui-icon name="collapse"></ui-icon>
          </button>

        </div>
        <div class="gameDialog-players">
          <game-player class="gameDialog-player is-left"></game-player>
          <div class="gameDialog-players-separator text-bicolor">vs</div>
          <game-player class="gameDialog-player is-right" direction="right"></game-player>
        </div>
        <div class="gameDialog-wrapper">
          <div class="gameDialog-content">
            <div class="gameDialog-title"></div>
            <div class="gameDialog-controls"></div>
          </div>
        </div>
      </div>
    `;

    this.querySelector('.gameDialog-enterFullscreen').addEventListener('click', enterFullscreen);
    this.querySelector('.gameDialog-exitFullscreen').addEventListener('click', exitFullscreen);
    this.querySelector('.gameDialog-theme-dark').addEventListener('click', () => selectTheme('dark'));
    this.querySelector('.gameDialog-theme-light').addEventListener('click', () => selectTheme('light'));
  }

  disconnectedCallback() {}

  renderPlayers(players, winner) {
    this.playerLeftEl = this.querySelector('.gameDialog-player.is-left');
    if (this.playerLeftEl) {
      this.playerLeftEl.setAttribute('name', players?.playerLeft?.name);
      this.playerLeftEl.setAttribute('avatar', players?.playerLeft?.avatar);
      if (players?.playerLeft?.type) {
        this.playerLeftEl.setAttribute('type', players.playerLeft.type);
      } else {
        this.playerLeftEl.removeAttribute('type');
      }
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
      this.playerRightEl.setAttribute('type', players?.playerRight?.type);
      if (players?.playerLeft?.type) {
        this.playerRightEl.setAttribute('type', players.playerRight.type);
      } else {
        this.playerRightEl.removeAttribute('type');
      }
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

  renderBack(back) {
    const backEl = this.querySelector('.gameDialog-back');
    console.log(back);
    backEl.hidden = !back;
    if (back?.action) {
      backEl.addEventListener('click', back.action);
    }
  }

  render(params = {}) {
    this.renderPlayers(params.players, params.winner);
    this.querySelector('.gameDialog-title').textContent = params.title;
    this.renderBack(params.back);
    this.renderControls(params.controls);
    this.hidden = !params.open;
  }
}

customElements.define('game-dialog', GameDialog);
