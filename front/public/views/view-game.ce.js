import PongGame from '../game/PongGame.js';

const template = `
<div class="pong">
  <div class="pong-modal">
    <div class="pong-title"></div>
    <div class="pong-controls">
      <button class="pong-btn pong-start">Start</button>
      <button class="pong-btn pong-pause">Pause</button>
      <button class="pong-btn pong-resume">Resume</button>
      <button class="pong-btn pong-quit">Quit</button>
      <button class="pong-btn pong-newGame">New game</button>
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

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.game = new PongGame();
    this.game.scoreFontSize = this.game.height * 0.15;

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
    this.startBtn?.addEventListener('click', this.game.start);
    this.pauseBtn = this.shadowRoot.querySelector('.pong-pause');
    this.pauseBtn?.addEventListener('click', this.game.pause);
    this.resumeBtn = this.shadowRoot.querySelector('.pong-resume');
    this.resumeBtn?.addEventListener('click', this.game.resume);
    this.quitBtn = this.shadowRoot.querySelector('.pong-quit');
    this.quitBtn?.addEventListener('click', () => {
      this.game.reset();
      this.render();
    });
    this.newGameBtn = this.shadowRoot.querySelector('.pong-newGame');
    this.newGameBtn?.addEventListener('click', () => {
      this.game.reset().start();
      this.render();
    });

    // Renderer
    this.rendererEl = this.shadowRoot.querySelector('.pong-renderer');
    this.rendererEl.init(this.game);

    // Events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('click', this.handleClick);

    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('click', this.handleClick);
  }

  render() {
    if (!this.shadowRoot) return;

    // Modal's visibility
    this.modalEl.hidden = !['initialized', 'paused', 'finished'].includes(this.game.status);

    // Title
    this.#updateTitle();

    // Controls' visibility
    this.startBtn.hidden = this.game.status !== 'initialized';
    this.pauseBtn.hidden = this.game.status !== 'running';
    this.resumeBtn.hidden = this.game.status !== 'paused';
    this.quitBtn.hidden = !['running', 'paused'].includes(this.game.status);
    this.newGameBtn.hidden = this.game.status !== 'finished';

    // Elements
    this.rendererEl.update(this.game);
    this.rendererEl.render();

    if (this.game.status !== 'finished') {
      requestAnimationFrame(this.render);
    }
  }

  #updateTitle() {
    if (!this.titleEl) return;

    let title;
    switch (this.game.status) {
      case 'initialized':
        title = 'New game';
        break;
      case 'running':
        title = `Round ${this.game.scoreLeft + this.game.scoreRight + 1}`;
        break;
      case 'paused':
        title = `Round ${this.game.scoreLeft + this.game.scoreRight + 1} - Paused`;
        break;
      case 'finished':
        const winner = this.game.scoreLeft > this.game.scoreRight ? 'Left' : 'Right';
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
      switch (this.game.status) {
        case 'initialized':
          this.game.start();
          return;
        case 'running':
          this.game.pause();
          return;
        case 'paused':
          this.game.resume();
          return;
        case 'finished':
          this.game.reset().start();
          this.render();
          return;
      }
    }

    // paddle moves
    if (!['w', 's', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    if (this.#keys[event.key]) return;

    this.#keys[event.key] = true;

    if (['w', 's'].includes(event.key)) {
      this.game.updatePaddleLeftMove(Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s)));
    } else {
      this.game.updatePaddleRightMove(Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown)));
    }
  }

  handleKeyUp(event) {
    // paddle moves (stop)
    if (!this.#keys[event.key]) return;

    this.#keys[event.key] = false;

    if (['w', 's'].includes(event.key)) {
      this.game.updatePaddleLeftMove(Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s)));
    } else {
      this.game.updatePaddleRightMove(Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown)));
    }
  }
}

customElements.define('view-game', ViewGame);
