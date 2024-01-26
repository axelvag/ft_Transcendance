import './components/game-renderer-2d.ce.js';
import GameLocalApi from './localApi/GameLocalApi.js';

const template = `
<div class="pong">
  <div class="pong-player pong-player-left">
    <img class="pong-player-avatar" src="https://sfgalleries.net/art/sf3/sf3-3soe/avatars/sf33soe-avatar-ryu.png" alt="Ryu" />
    <div class="pong-player-name">Ryu</div>
    <div class="pong-player-score">3</div>
  </div>
  <div class="pong-player pong-player-right">
    <img class="pong-player-avatar" src="https://sfgalleries.net/art/sf3/sf3-3soe/avatars/sf33soe-avatar-chun-li.png" alt="Ryu" />
    <div class="pong-player-name">Chun-Li</div>
    <div class="pong-player-score">1</div>
  </div>
  <div class="pong-dialog">
    <div class="pong-title"></div>
    <div class="pong-controls">
      <button class="pong-btn pong-start" hidden>Start</button>
      <button class="pong-btn pong-pause" hidden>Pause</button>
      <button class="pong-btn pong-resume" hidden>Resume</button>
      <button class="pong-btn pong-quit" hidden>Quit</button>
      <button class="pong-btn pong-newGame" hidden>New game</button>
    </div>
  </div>
  <game-renderer-2d class="pong-renderer"></game-renderer-2d>
</div>
`;

const style = `
*,
*::before,
*::after {
	box-sizing: border-box;
}

[hidden] {
	display: none !important;
}

.pong {
	color: white;
	background-color: black;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	width: 100svw;
	height: 100svh;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	padding: 3rem;
	gap: 2rem;
}

.pong-dialog {
	position: absolute;
	inset: 0;

	display: flex;
	justify-content: center;
	align-items: center;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	padding: 3rem;
	gap: 2rem;

	background-color: rgba(0, 0, 0, 0.75);
	backdrop-filter: blur(8px);
}

.pong-title {
	font-weight: bold;
	font-size: 1.5rem;
}

.pong-controls {
	display: flex;
	gap: 0.75rem;
}

.pong-btn {
	/* Reset */
	outline: none !important;

	background: transparent;
	color: white;
	border: 1px solid white;
	padding: 0.375em 0.75em;
	font-size: 0.875rem;
	vertical-align: -0.2em;
	cursor: pointer;
}

.pong-btn:hover {
  background-color: white;
  color: black;
}

.pong-renderer {
	max-width: 800px;
	height: 600px;
	user-select: none;
}

.pong-player-left {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  margin: 1rem;
}
.pong-player-right {
  position: fixed;
  z-index: 9999;
  top: 0;
  right: 0;
  margin: 1rem;
}

.pong-player-avatar {
  display: block;
  width: 5rem;
  height: 5rem;
  object-fit: cover;
  border: 4px solid #fff;
  background: #fff;
  border-radius: 8px;
}

.pong-player-name {
  font-weight: bold;
  white-space: nowrap;
  max-width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  top: 0;
}
.pong-player-left .pong-player-name {
  left: 6rem;
}
.pong-player-right .pong-player-name {
  right: 6rem;
}
`;

class ViewGame extends HTMLElement {
  #keys = {};
  #gameState = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.gameApi = new GameLocalApi();

    this.renderDialog = this.renderDialog.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        ${style}
      </style>
      ${template}
    `;

    // Dialog
    this.dialogEl = this.shadowRoot.querySelector('.pong-dialog');

    // Title
    this.titleEl = this.shadowRoot.querySelector('.pong-title');

    // Controls
    this.startBtn = this.shadowRoot.querySelector('.pong-start');
    this.startBtn?.addEventListener('click', () => {
      this.gameApi.emit('start');
    });

    this.pauseBtn = this.shadowRoot.querySelector('.pong-pause');
    this.pauseBtn?.addEventListener('click', () => {
      this.gameApi.emit('pause');
    });

    this.resumeBtn = this.shadowRoot.querySelector('.pong-resume');
    this.resumeBtn?.addEventListener('click', () => {
      this.gameApi.emit('resume');
    });

    this.quitBtn = this.shadowRoot.querySelector('.pong-quit');
    this.quitBtn?.addEventListener('click', () => {
      this.gameApi.emit('reset');
      this.renderDialog();
    });

    this.newGameBtn = this.shadowRoot.querySelector('.pong-newGame');
    this.newGameBtn?.addEventListener('click', () => {
      this.gameApi.emit('reset');
      this.gameApi.emit('start');
      this.renderDialog();
    });

    // Renderer
    this.rendererEl = this.shadowRoot.querySelector('.pong-renderer');

    this.gameApi.on('init', data => {
      // todo: validate data
      this.#gameState = JSON.parse(data);
      this.renderDialog();
      this.rendererEl.init(this.#gameState);
      this.rendererEl.start();
    });
    this.gameApi.on('update', data => {
      // todo: validate data
      const updates = JSON.parse(data);
      this.#gameState = {
        ...this.#gameState,
        ...updates,
      };
      this.renderDialog();
      this.rendererEl.update(updates);
      if (updates.status === 'finished') {
        this.rendererEl.stop();
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
        title = `Round ${this.#gameState.scoreLeft + this.#gameState.scoreRight + 1} - Paused`;
        actions = ['resume', 'quit'];
        break;
      case 'finished':
        isVisible = true;
        const winner = this.#gameState.scoreLeft > this.#gameState.scoreRight ? 'Left' : 'Right';
        title = `${winner} player wins!`;
        actions = ['newGame'];
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
