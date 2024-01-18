import PongGame from '../game/PongGame.js';

const template = game => `
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
  <svg
    class="pong-renderer"
    viewBox="0 0 ${game.width} ${game.height}"
  >

    <!-- Walls -->
    <rect
      class="pong-wall pong-wall-top"
      x="${game.wallThickness / 2}"
      y="${game.wallThickness / 2}"
      width="${game.width - game.wallThickness}"
      height="${game.height - game.wallThickness}"
      stroke-width="${game.wallThickness}"
      stroke="#fff"
      fill="rgba(0, 0, 0, 0)"
    ></rect>

    <!-- Middle line -->
    <line
      class="pong-middle"
      x1="${game.width / 2}"
      y1="${game.wallThickness}"
      x2="${game.width / 2}"
      y2="${game.height - game.wallThickness}"
      stroke-width="${game.wallThickness}"
      stroke-dasharray="${game.wallThickness}, ${game.wallThickness * 1.5}"
      stroke="#fff"
    ></line>

    <!-- Left score -->
    <text
      class="pong-score pong-score-left"
      font-family="Silkscreen, sans-serif"
      font-size="${game.scoreFontSize}"
      text-anchor="middle"
      x="${game.width / 4}"
      y="${game.wallThickness}"
      dx="0"
      dy="${game.scoreFontSize}"
      fill="#fff"
    >0</text>

    <!-- Right score -->
    <text
      class="pong-score pong-score-right"
      font-family="Silkscreen, sans-serif"
      font-size="${game.scoreFontSize}"
      text-anchor="middle"
      x="${(game.width * 3) / 4}"
      y="${game.wallThickness}"
      dx="0"
      dy="${game.scoreFontSize}"
      fill="#fff"
    >0</text>

    <!-- Left paddle -->
    <rect
      class="pong-paddle pong-paddle-left"
      x="${game.width / 2 + game.paddleLeft.left()}"
      y="${game.height / 2 - game.paddleLeft.top()}"
      width="${game.paddleLeft.width}"
      height="${game.paddleLeft.height}"
      fill="#fff"
    ></rect>

    <!-- Right paddle -->
    <rect
      class="pong-paddle pong-paddle-right"
      x="${game.width / 2 + game.paddleRight.left()}"
      y="${game.height / 2 - game.paddleRight.top()}"
      width="${game.paddleRight.width}"
      height="${game.paddleRight.height}"
      fill="#fff"
    ></rect>

    <!-- Ball -->
    <rect
      class="pong-ball"
      x="${game.width / 2 + game.ball.left()}"
      y="${game.height / 2 - game.ball.top()}"
      width="${game.ball.width}"
      height="${game.ball.height}"
      fill="#fff"
    ></rect>

  </svg>
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
</style>
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
      ${template(this.game)}
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

    // Elements
    this.ballEl = this.shadowRoot.querySelector('.pong-ball');
    this.paddleLeftEl = this.shadowRoot.querySelector('.pong-paddle-left');
    this.paddleRightEl = this.shadowRoot.querySelector('.pong-paddle-right');
    this.scoreLeftEl = this.shadowRoot.querySelector('.pong-score-left');
    this.scoreRightEl = this.shadowRoot.querySelector('.pong-score-right');

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
    this.#setBallPosition(this.game.ball.center());
    this.#setPaddleLeftPosition(this.game.paddleLeft.center());
    this.#setPaddleRightPosition(this.game.paddleRight.center());
    this.#setScoreLeft(this.game.scoreLeft);
    this.#setScoreRight(this.game.scoreRight);

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

  #setBallPosition(ballPos) {
    const newX = this.game.width / 2 + ballPos.x - this.game.ball.width / 2;
    this.ballEl?.setAttribute('x', newX);
    const newY = this.game.height / 2 - ballPos.y - this.game.ball.height / 2;
    this.ballEl?.setAttribute('y', newY);
  }

  #setPaddleLeftPosition(paddlePos) {
    const newX = this.game.width / 2 + paddlePos.x - this.game.paddleLeft.width / 2;
    this.paddleLeftEl?.setAttribute('x', newX);
    const newY = this.game.height / 2 - paddlePos.y - this.game.paddleLeft.height / 2;
    this.paddleLeftEl?.setAttribute('y', newY);
  }

  #setPaddleRightPosition(paddlePos) {
    const newX = this.game.width / 2 + paddlePos.x - this.game.paddleRight.width / 2;
    this.paddleRightEl?.setAttribute('x', newX);
    const newY = this.game.height / 2 - paddlePos.y - this.game.paddleRight.height / 2;
    this.paddleRightEl?.setAttribute('y', newY);
  }

  #setScoreLeft(score) {
    if (!this.scoreLeftEl) return;
    this.scoreLeftEl.textContent = score;
  }

  #setScoreRight(score) {
    if (!this.scoreRightEl) return;
    this.scoreRightEl.textContent = score;
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
