import './components/game-renderer-2d.ce.js';
import './components/game-player.ce.js';
import './components/game-scoreboard.ce.js';
import GameLocalApi from './localApi/GameLocalApi.js';

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
<div class="pong">
  <div class="pong-header">
    <game-scoreboard></game-scoreboard>
  </div>
  <div class="pong-body">
    <div class="pong-body-left">
      <game-player
        avatar="https://sfgalleries.net/art/sf3/sf3-3soe/avatars/sf33soe-avatar-ryu.png"
        name="Ryu"
        score="0"
        score-max="5"
      ></game-player>
    </div>
    <div class="pong-body-center">
      <game-renderer-2d class="pong-renderer"></game-renderer-2d>
    </div>
    <div class="pong-body-right">
      <game-player
        avatar="https://sfgalleries.net/art/sf3/sf3-3soe/avatars/sf33soe-avatar-chun-li.png"
        name="Chun-Li"
        score="0"
        score-max="5"
        right
      ></game-player>
    </div>
  </div>
  <div class="pong-footer">
    <div class="pong-tip">
      <span class="pong-tip-icon">
        <ui-icon name="bulb"></ui-icon>
      </span>
      <span class="pong-tip-text">Press Spacebar to pause / resume the game.</span>
    </div>
  </div>
  <div class="pong-dialog">
    <div class="pong-dialog-wrapper">
      <div class="pong-dialog-content">
        <div class="pong-dialog-title"></div>
        <div class="pong-dialog-controls">
          <button class="pong-dialog-btn fs-2 pong-start" hidden>
            <ui-icon name="play" scale="1.25"></ui-icon>
          </button>
          <button class="pong-dialog-btn pong-pause" hidden>
            <ui-icon name="pause"></ui-icon>
          </button>
          <button class="pong-dialog-btn pong-newGame" hidden>
            <ui-icon name="restart"></ui-icon>
          </button>
          <button class="pong-dialog-btn fs-1 pong-resume" hidden>
            <ui-icon name="play" scale="1.25"></ui-icon>
          </button>
          <button class="pong-dialog-btn pong-quit" hidden>
            <ui-icon name="quit"></ui-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`;

const style = `
.pong {
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

.pong-header {
  flex: 0 0 auto;
  padding: 1.5rem;
}

.pong-body {
  flex: 1 1 0;
  overflow: hidden;
  display: flex;
}

.pong-body-center {
  flex: 0 1 auto;
  padding: 0 1rem;
}

.pong-body-left,
.pong-body-right {
  flex: 1 1 0;
  padding: 3rem;
}

.pong-footer {
  flex: 0 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.pong-tip {
  font-size: 0.875rem;
  color: var(--bs-gray-600);
}

.pong-tip-icon {
  flex: 0 0 auto;
  font-size: 1.25rem;
}

.pong-dialog {
	position: fixed;
	inset: 0;
  z-index: 9999;
	background: rgba(0, 0, 0, 0.75);

  display: flex;
  align-items: center;
}

.pong-dialog-wrapper {
  flex: 1 1 0;
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

.pong-dialog-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pong-dialog-title {
	font-weight: bold;
	font-size: 2.25rem;
  text-transform: uppercase;
  font-family: Orbitron, sans-serif;
}

.pong-dialog-controls {
	display: flex;
  align-items: center;
	gap: 1.5rem;
}

.pong-dialog-btn {
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

.pong-dialog-btn:hover {
  opacity: 1;
}

.pong-renderer {
  flex: 1 1 0;
	user-select: none;
}
`;

class ViewGame extends HTMLElement {
  #keys = {};
  #gameState = null;

  constructor() {
    super();

    this.gameApi = new GameLocalApi();

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
    this.dialogEl = this.querySelector('.pong-dialog');

    // Title
    this.titleEl = this.querySelector('.pong-dialog-title');

    // Controls
    this.startBtn = this.querySelector('.pong-start');
    this.startBtn?.addEventListener('click', () => {
      this.gameApi.emit('start');
    });

    this.pauseBtn = this.querySelector('.pong-pause');
    this.pauseBtn?.addEventListener('click', () => {
      this.gameApi.emit('pause');
    });

    this.resumeBtn = this.querySelector('.pong-resume');
    this.resumeBtn?.addEventListener('click', () => {
      this.gameApi.emit('resume');
    });

    this.quitBtn = this.querySelector('.pong-quit');
    this.quitBtn?.addEventListener('click', () => {
      this.gameApi.emit('reset');
      this.renderDialog();
    });

    this.newGameBtn = this.querySelector('.pong-newGame');
    this.newGameBtn?.addEventListener('click', () => {
      this.gameApi.emit('reset');
      this.gameApi.emit('start');
      this.renderDialog();
    });

    // Renderer
    this.rendererEl = this.querySelector('.pong-renderer');

    this.gameApi.on('init', data => {
      const json = JSON.parse(data);
      // todo: validate data
      this.#gameState = json?.state;
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

  renderScores() {
    this.querySelector('game-player:not([right])')?.setAttribute('score', this.#gameState.scoreLeft || 0);
    this.querySelector('game-scoreboard')?.setAttribute('score-left', this.#gameState.scoreLeft || 0);
    this.querySelector('game-player[right]')?.setAttribute('score', this.#gameState.scoreRight || 0);
    this.querySelector('game-scoreboard')?.setAttribute('score-right', this.#gameState.scoreRight || 0);
  }

  renderDialog() {
    let isVisible = false;
    let title = '';
    let actions = [];

    switch (this.#gameState.status) {
      case 'initialized':
        isVisible = true;
        title = 'New game';
        actions = ['start'];
        break;
      case 'running':
        isVisible = false;
        break;
      case 'paused':
        isVisible = true;
        title = `Paused`;
        actions = ['newGame', 'resume', 'quit'];
        break;
      case 'finished':
        isVisible = true;
        const winner = this.#gameState.scoreLeft > this.#gameState.scoreRight ? 'Left' : 'Right';
        title = `${winner} player wins!`;
        actions = ['newGame', 'quit'];
        break;
    }

    this.dialogEl.hidden = !isVisible;
    this.titleEl.textContent = title;
    this.startBtn.hidden = !actions.includes('start');
    this.pauseBtn.hidden = !actions.includes('pause');
    this.resumeBtn.hidden = !actions.includes('resume');
    this.quitBtn.hidden = !actions.includes('quit');
    this.newGameBtn.hidden = !actions.includes('newGame');
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
