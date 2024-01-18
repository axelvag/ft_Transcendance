import './components/game-renderer-2d.ce.js';
import PongGame from './localApi/PongGame.js';

const template = `
<div class="pong">
  <div class="pong-modal">
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

.pong-modal {
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
`;

class ViewGame extends HTMLElement {
  #keys = {};
  #gameState = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.game = new PongGame();

    this.render = this.render.bind(this);
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

    // Modal
    this.modalEl = this.shadowRoot.querySelector('.pong-modal');

    // Title
    this.titleEl = this.shadowRoot.querySelector('.pong-title');

    // Controls
    this.startBtn = this.shadowRoot.querySelector('.pong-start');
    this.startBtn?.addEventListener('click', () => {
      this.game.emit('start');
    });

    this.pauseBtn = this.shadowRoot.querySelector('.pong-pause');
    this.pauseBtn?.addEventListener('click', () => {
      this.game.emit('pause');
    });

    this.resumeBtn = this.shadowRoot.querySelector('.pong-resume');
    this.resumeBtn?.addEventListener('click', () => {
      this.game.emit('resume');
    });

    this.quitBtn = this.shadowRoot.querySelector('.pong-quit');
    this.quitBtn?.addEventListener('click', () => {
      this.game.emit('reset');
      this.render();
    });

    this.newGameBtn = this.shadowRoot.querySelector('.pong-newGame');
    this.newGameBtn?.addEventListener('click', () => {
      this.game.emit('reset');
      this.game.emit('start');
      this.render();
    });

    // Renderer
    this.rendererEl = this.shadowRoot.querySelector('.pong-renderer');

    this.game.on('init', data => {
      // todo: validate data
      this.#gameState = JSON.parse(data);
      this.rendererEl.init(this.#gameState);
      this.render();
    });
    this.game.on('update', data => {
      // todo: validate data
      const updates = JSON.parse(data);
      this.#gameState = {
        ...this.#gameState,
        ...updates,
      };
      this.rendererEl.update(updates);
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

  render() {
    if (!this.shadowRoot) return;

    // Modal's visibility
    this.modalEl.hidden = !['initialized', 'paused', 'finished'].includes(this.#gameState?.status);

    // Title
    this.#updateTitle();

    // Controls' visibility
    this.startBtn.hidden = this.#gameState?.status !== 'initialized';
    this.pauseBtn.hidden = this.#gameState?.status !== 'running';
    this.resumeBtn.hidden = this.#gameState?.status !== 'paused';
    this.quitBtn.hidden = !['running', 'paused'].includes(this.#gameState?.status);
    this.newGameBtn.hidden = this.#gameState?.status !== 'finished';

    // Elements
    this.rendererEl.render();

    if (this.#gameState.status !== 'finished') {
      requestAnimationFrame(this.render);
    }
  }

  #updateTitle() {
    if (!this.titleEl) return;

    let title;
    switch (this.#gameState.status) {
      case 'initialized':
        title = 'New game';
        break;
      case 'running':
        title = `Round ${this.#gameState.scoreLeft + this.#gameState.scoreRight + 1}`;
        break;
      case 'paused':
        title = `Round ${this.#gameState.scoreLeft + this.#gameState.scoreRight + 1} - Paused`;
        break;
      case 'finished':
        const winner = this.#gameState.scoreLeft > this.#gameState.scoreRight ? 'Left' : 'Right';
        title = `${winner} player wins!`;
        break;
      default:
        title = ' ';
    }

    this.titleEl.textContent = title;
  }

  handleKeyDown(event) {
    // space
    if (event.code === 'Space') {
      switch (this.#gameState.status) {
        case 'initialized':
          this.game.emit('start');
          return;
        case 'running':
          this.game.emit('pause');
          return;
        case 'paused':
          this.game.emit('resume');
          return;
        case 'finished':
          this.game.emit('reset');
          this.game.emit('start');
          this.render();
          return;
      }
    }

    // paddle moves
    if (!['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    if (this.#keys[event.key]) return;

    this.#keys[event.key] = true;

    if (['w', 's'].includes(event.key)) {
      const dir = Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s));
      this.game.emit('updatePaddleLeftMove', dir);
    } else {
      const dir = Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown));
      this.game.emit('updatePaddleRightMove', dir);
    }
  }

  handleKeyUp(event) {
    // paddle moves (stop)
    if (!this.#keys[event.key]) return;

    this.#keys[event.key] = false;

    if (['w', 's'].includes(event.key)) {
      const dir = Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s));
      this.game.emit('updatePaddleLeftMove', dir);
    } else {
      const dir = Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown));
      this.game.emit('updatePaddleRightMove', dir);
    }
  }
}

customElements.define('view-game', ViewGame);
