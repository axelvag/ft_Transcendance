import './components/game-renderer-2d.ce.js';
import './components/game-player.ce.js';
import './components/game-scoreboard.ce.js';
import GameLocalApi from './localApi/GameLocalApi.js';
import { redirectTo } from '../router.js';

const sounds = {
  collision: new Audio('./assets/sounds/hit.wav'),
  score: new Audio('./assets/sounds/score.wav'),
  victory: new Audio('./assets/sounds/victory.wav'),
  defeat: new Audio('./assets/sounds/defeat.wav'),
};
Object.values(sounds).forEach(sound => {
  sound.preload = 'auto';
});

const template = `
<div class="viewGame">
  <div class="viewGame-header">
    <game-scoreboard></game-scoreboard>
  </div>
  <div class="viewGame-body">
    <div class="viewGame-body-left">
      <game-player class="viewGame-player-left"></game-player>
    </div>
    <div class="viewGame-body-center">
      <game-renderer-2d class="viewGame-renderer"></game-renderer-2d>
    </div>
    <div class="viewGame-body-right">
      <game-player class="viewGame-player-right"></game-player>
    </div>
  </div>
  <div class="viewGame-footer">
    <div class="viewGame-tip">
      <span class="viewGame-tip-icon">
        <ui-icon name="bulb"></ui-icon>
      </span>
      <span class="viewGame-tip-text">Press Spacebar to pause / resume the game.</span>
    </div>
  </div>
  <div class="viewGame-dialog">
    <div class="viewGame-dialog-players">
      <game-player class="viewGame-dialog-player is-left"></game-player>
      <div class="viewGame-dialog-players-separator text-gradient">vs</div>
      <game-player class="viewGame-dialog-player is-right"></game-player>
    </div>
    <div class="viewGame-dialog-wrapper">
      <div class="viewGame-dialog-content">
        <div class="viewGame-dialog-title"></div>
        <div class="viewGame-dialog-controls">
          <button class="viewGame-dialog-btn fs-2 viewGame-start" hidden>
            <ui-icon name="play" scale="1.25"></ui-icon>
          </button>
          <button class="viewGame-dialog-btn viewGame-pause" hidden>
            <ui-icon name="pause"></ui-icon>
          </button>
          <button class="viewGame-dialog-btn viewGame-newGame" hidden>
            <ui-icon name="restart"></ui-icon>
          </button>
          <button class="viewGame-dialog-btn fs-1 viewGame-resume" hidden>
            <ui-icon name="play" scale="1.25"></ui-icon>
          </button>
          <button class="viewGame-dialog-btn viewGame-quit" hidden>
            <ui-icon name="quit"></ui-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`;

const style = `
.viewGame {
	color: white;
	background-color: black;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	width: 100svw;
	height: 100svh;

	display: flex;
	flex-direction: column;
	align-items: stretch;
  overflow: hidden;
}

.viewGame-header {
  flex: 0 0 auto;
  padding: 1.5rem;
}

.viewGame-body {
  flex: 1 1 0;
  overflow: hidden;
  display: flex;
}

.viewGame-body-center {
  flex: 0 1 auto;
  padding: 0 1rem;
}

.viewGame-body-left,
.viewGame-body-right {
  flex: 1 1 0;
  padding: 3rem;
}

.viewGame-footer {
  flex: 0 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.viewGame-tip {
  font-size: 0.875rem;
  color: var(--bs-gray-600);
}

.viewGame-tip-icon {
  flex: 0 0 auto;
  font-size: 1.25rem;
}

.viewGame-dialog {
	position: fixed;
	inset: 0;
  z-index: 9999;
	background: rgba(0, 0, 0, 0.75);

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8vh;
}

.viewGame-dialog-players {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.viewGame-dialog-players-separator {
  flex: 0 0 auto;
  font-family: Orbitron, sans-serif;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 3rem;
  margin: -4rem 8rem 0;
}
.viewGame-dialog-players:has([winner]) .viewGame-dialog-player:not([winner]) {
  font-size: 1.5rem;
}
.viewGame-dialog-player.is-left[winner] {
  margin-left: -7.5rem;
}
.viewGame-dialog-player.is-right[winner] {
  margin-right: -7.5rem;
}

.viewGame-dialog-wrapper {
  flex: 0 0 auto;
  background: #000;
  background-image: linear-gradient(
    to right,
    rgba(var(--bs-primary-rgb), 0.5) 0%,
    rgba(var(--bs-secondary-rgb), 0.5) 100%
  );
  border: 1px solid #fff;
  border-width: 2px 0;

  display: flex;
  justify-content: center;
}

.viewGame-dialog-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.viewGame-dialog-title {
	font-weight: bold;
	font-size: 2.25rem;
  text-transform: uppercase;
  font-family: Orbitron, sans-serif;
}

.viewGame-dialog-controls {
	display: flex;
  align-items: center;
	gap: 1.5rem;
}

.viewGame-dialog-btn {
  width: 2em;
  height: 2em;
  border-radius: 100%;
  outline: none !important;
  border: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: white;
  color: black;
	cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s ease-in-out;
}

.viewGame-dialog-btn:hover {
  opacity: 1;
}

.viewGame-renderer {
  flex: 1 1 0;
	user-select: none;
}
`;

class ViewGame extends HTMLElement {
  #keys = {};
  #gameState = null;

  constructor() {
    super();

    const params = new URLSearchParams(window.location.search);
    this.gameApi = new GameLocalApi({
      playerLeft: params.get('player1'),
      playerRight: params.get('player2'),
    });

    this.renderDialog = this.renderDialog.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        ${style}
      </style>
      ${template}
    `;

    // Dialog
    this.dialogEl = this.querySelector('.viewGame-dialog');

    // Players
    this.dialogPlayersEl = this.querySelector('.viewGame-dialog-players');
    this.dialogPlayerLeftEl = this.querySelector('.viewGame-dialog-player.is-left');
    this.dialogPlayerRightEl = this.querySelector('.viewGame-dialog-player.is-right');

    // Title
    this.dialogTitleEl = this.querySelector('.viewGame-dialog-title');

    // Controls
    this.dialogStartBtn = this.querySelector('.viewGame-start');
    this.dialogStartBtn?.addEventListener('click', () => {
      this.gameApi.emit('start');
    });

    this.dialogPauseBtn = this.querySelector('.viewGame-pause');
    this.dialogPauseBtn?.addEventListener('click', () => {
      this.gameApi.emit('pause');
    });

    this.dialogResumeBtn = this.querySelector('.viewGame-resume');
    this.dialogResumeBtn?.addEventListener('click', () => {
      this.gameApi.emit('resume');
    });

    this.dialogQuitBtn = this.querySelector('.viewGame-quit');
    this.dialogQuitBtn?.addEventListener('click', () => {
      redirectTo('/profil');
    });

    this.dialogNewGameBtn = this.querySelector('.viewGame-newGame');
    this.dialogNewGameBtn?.addEventListener('click', () => {
      this.gameApi.emit('reset');
      this.gameApi.emit('start');
      this.renderDialog();
    });

    // Renderer
    this.rendererEl = this.querySelector('.viewGame-renderer');

    this.gameApi.on('init', data => {
      const json = JSON.parse(data);
      // todo: validate data
      this.#gameState = json?.state;
      this.renderPlayers();
      this.renderDialog();
      this.renderScores();
      this.rendererEl.init(this.#gameState);
      this.rendererEl.start();
    });
    this.gameApi.on('update', data => {
      const json = JSON.parse(data);
      // todo: validate data
      const updates = json?.state;
      this.#gameState = {
        ...this.#gameState,
        ...updates,
      };

      // dialog
      this.renderDialog();

      // renderer
      this.rendererEl.update(updates);
      if (updates.status === 'finished') {
        this.rendererEl.stop();
      }

      // players and board
      if (updates.scoreLeft != null || updates.scoreRight != null) {
        this.renderScores();
      }

      // sounds
      if (json?.event) {
        const sound = sounds[json.event];
        if (sound) {
          sound.currentTime = 0;
          sound.play();
        }
      }
    });

    // Events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('click', this.handleClick);
    this.gameApi.emit('reset');
  }

  renderPlayers() {
    this.playerLeftEl = this.querySelector('.viewGame-player-left');
    if (this.playerLeftEl) {
      this.playerLeftEl.setAttribute('name', this.#gameState.playerLeft.name);
      this.playerLeftEl.setAttribute('avatar', this.#gameState.playerLeft.avatar);
      this.playerLeftEl.setAttribute('score', 0);
      this.playerLeftEl.setAttribute('score-max', this.#gameState.scoreMax);
    }

    this.playerRightEl = this.querySelector('.viewGame-player-right');
    if (this.playerLeftEl) {
      this.playerRightEl.setAttribute('name', this.#gameState.playerRight.name);
      this.playerRightEl.setAttribute('avatar', this.#gameState.playerRight.avatar);
      this.playerRightEl.setAttribute('score', 0);
      this.playerRightEl.setAttribute('score-max', this.#gameState.scoreMax);
      this.playerRightEl.setAttribute('direction', 'right');
    }

    this.dialogPlayerLeftEl = this.querySelector('.viewGame-dialog-player.is-left');
    if (this.playerLeftEl) {
      this.dialogPlayerLeftEl.setAttribute('name', this.#gameState.playerLeft.name);
      this.dialogPlayerLeftEl.setAttribute('avatar', this.#gameState.playerLeft.avatar);
    }

    this.dialogPlayerRightEl = this.querySelector('.viewGame-dialog-player.is-right');
    if (this.playerLeftEl) {
      this.dialogPlayerRightEl.setAttribute('name', this.#gameState.playerRight.name);
      this.dialogPlayerRightEl.setAttribute('avatar', this.#gameState.playerRight.avatar);
      this.dialogPlayerRightEl.setAttribute('direction', 'right');
    }
  }

  renderScores() {
    this.querySelector('.viewGame-player-left')?.setAttribute('score', this.#gameState.scoreLeft || 0);
    this.querySelector('game-scoreboard')?.setAttribute('score-left', this.#gameState.scoreLeft || 0);
    this.querySelector('.viewGame-player-right')?.setAttribute('score', this.#gameState.scoreRight || 0);
    this.querySelector('game-scoreboard')?.setAttribute('score-right', this.#gameState.scoreRight || 0);
  }

  renderDialog() {
    let isVisible = false;
    let showPlayers = false;
    let winner = null;
    let title = '';
    let actions = [];

    switch (this.#gameState.status) {
      case 'initialized':
        isVisible = true;
        showPlayers = true;
        title = 'Ready?';
        actions = ['start'];
        break;
      case 'paused':
        isVisible = true;
        title = `Paused`;
        actions = ['newGame', 'resume', 'quit'];
        break;
      case 'finished':
        isVisible = true;
        showPlayers = true;
        winner = this.#gameState.scoreLeft > this.#gameState.scoreRight ? 'left' : 'right';
        const winnerPlayer = winner === 'left' ? this.#gameState.playerLeft : this.#gameState.playerRight;
        title = `${winnerPlayer.name} wins!`;
        actions = ['newGame', 'quit'];
        break;
      default:
        isVisible = false;
    }

    this.dialogEl.hidden = !isVisible;
    this.dialogPlayersEl.hidden = !showPlayers;
    if (winner === 'left') {
      this.dialogPlayerLeftEl.setAttribute('winner', '');
    } else {
      this.dialogPlayerLeftEl.removeAttribute('winner');
    }
    if (winner === 'right') {
      this.dialogPlayerRightEl.setAttribute('winner', '');
    } else {
      this.dialogPlayerRightEl.removeAttribute('winner');
    }
    this.dialogTitleEl.textContent = title;
    this.dialogStartBtn.hidden = !actions.includes('start');
    this.dialogPauseBtn.hidden = !actions.includes('pause');
    this.dialogResumeBtn.hidden = !actions.includes('resume');
    this.dialogQuitBtn.hidden = !actions.includes('quit');
    this.dialogNewGameBtn.hidden = !actions.includes('newGame');
  }

  handleKeyDown(event) {
    // space
    if (event.code === 'Space') {
      switch (this.#gameState.status) {
        case 'initialized':
          this.gameApi.emit('start');
          return;
        case 'running':
          this.gameApi.emit('pause');
          return;
        case 'paused':
          this.gameApi.emit('resume');
          return;
        case 'finished':
          this.gameApi.emit('reset');
          this.gameApi.emit('start');
          this.renderDialog();
          return;
      }
    }

    // paddle moves
    if (!['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    if (this.#keys[event.key]) return;

    this.#keys[event.key] = true;

    if (['w', 's'].includes(event.key)) {
      const dir = Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s));
      this.gameApi.emit('updatePaddleLeftMove', dir);
    } else {
      const dir = Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown));
      this.gameApi.emit('updatePaddleRightMove', dir);
    }
  }

  handleKeyUp(event) {
    // paddle moves (stop)
    if (!this.#keys[event.key]) return;

    this.#keys[event.key] = false;

    if (['w', 's'].includes(event.key)) {
      const dir = Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s));
      this.gameApi.emit('updatePaddleLeftMove', dir);
    } else {
      const dir = Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown));
      this.gameApi.emit('updatePaddleRightMove', dir);
    }
  }
}

customElements.define('view-game', ViewGame);
