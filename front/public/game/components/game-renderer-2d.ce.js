class GameRenderer2D extends HTMLElement {
  #isReady = false;
  #gameState = null;
  #animationId = null;

  #ballEl = null;
  #paddleLeftEl = null;
  #paddleRightEl = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render = this.render.bind(this);
    this.loop = this.loop.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  disconnectedCallback() {
    this.stop();
  }

  init(gameState) {
    // todo: validate gameState
    this.#gameState = gameState;
    this.shadowRoot.innerHTML = `
      <style>
        svg {
          width: 100%;
          height: 100%;
          user-select: none;
        }
        .pong-paddle-left {
          fill: var(--bs-primary);
        }
        .pong-paddle-right {
          fill: var(--bs-secondary);
        }
        .pong-wall {
          stroke: var(--bs-gray-900);
        }
        .pong-middle {
          stroke: var(--bs-gray-900);
        }
      </style>
      <svg viewBox="0 0 ${this.#gameState.width} ${this.#gameState.height}">
      
        <!-- Middle line -->
        <line
          class="pong-middle"
          x1="${this.#gameState.width / 2}"
          y1="${this.#gameState.wallThickness}"
          x2="${this.#gameState.width / 2}"
          y2="${this.#gameState.height - this.#gameState.wallThickness}"
          stroke-width="4"
          stroke-dasharray="4, 6"
          stroke="#fff"
        />

        <!-- Ball -->
        <rect
          class="pong-ball"
          x="${this.#gameState.width / 2 + this.#getLeft(this.#gameState.ball)}"
          y="${this.#gameState.height / 2 - this.#getTop(this.#gameState.ball)}"
          width="${this.#gameState.ball.width}"
          height="${this.#gameState.ball.height}"
          fill="#fff"
        />

        <!-- Left paddle -->
        <rect
          class="pong-paddle pong-paddle-left"
          x="${this.#gameState.width / 2 + this.#getLeft(this.#gameState.paddleLeft)}"
          y="${this.#gameState.height / 2 - this.#getTop(this.#gameState.paddleLeft)}"
          width="${this.#gameState.paddleLeft.width}"
          height="${this.#gameState.paddleLeft.height}"
          fill="#fff"
        />

        <!-- Right paddle -->
        <rect
          class="pong-paddle pong-paddle-right"
          x="${this.#gameState.width / 2 + this.#getLeft(this.#gameState.paddleRight)}"
          y="${this.#gameState.height / 2 - this.#getTop(this.#gameState.paddleRight)}"
          width="${this.#gameState.paddleRight.width}"
          height="${this.#gameState.paddleRight.height}"
          fill="#fff"
        />
      
        <!-- Walls -->
        <rect
          class="pong-wall pong-wall-top"
          x="${this.#gameState.wallThickness / 2}"
          y="${this.#gameState.wallThickness / 2}"
          rx="${this.#gameState.wallThickness * 2}"
          width="${this.#gameState.width - this.#gameState.wallThickness}"
          height="${this.#gameState.height - this.#gameState.wallThickness}"
          stroke-width="${this.#gameState.wallThickness}"
          stroke="#fff"
          fill="transparent"
        />

      </svg>
    `;

    // Elements
    this.#ballEl = this.shadowRoot.querySelector('.pong-ball');
    this.#paddleLeftEl = this.shadowRoot.querySelector('.pong-paddle-left');
    this.#paddleRightEl = this.shadowRoot.querySelector('.pong-paddle-right');

    this.#isReady = true;
  }

  update(newState) {
    if (!this.#isReady) return;
    this.#gameState = {
      ...this.#gameState,
      ...newState,
    };
  }

  render() {
    if (!this.#isReady) return;
    this.#setBallPosition(this.#getCenter(this.#gameState.ball));
    this.#setPaddleLeftPosition(this.#getCenter(this.#gameState.paddleLeft));
    this.#setPaddleRightPosition(this.#getCenter(this.#gameState.paddleRight));
  }

  loop() {
    if (!this.#isReady) return;
    this.render();
    this.#animationId = requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.#isReady || this.#animationId) return;
    this.loop();
  }

  stop() {
    if (!this.#animationId) return;
    cancelAnimationFrame(this.#animationId);
    this.#animationId = null;
  }

  #getCenter(rect, time) {
    if (!rect) return { x: 0, y: 0 };

    time = time || Date.now();
    if (rect.startTime >= rect.endTime) return rect.endCenter;
    if (time > rect.endTime) return rect.endCenter;
    if (time < rect.startTime) return rect.startCenter;

    const progress = (time - rect.startTime) / (rect.endTime - rect.startTime);
    const center = {
      x: rect.startCenter.x + (rect.endCenter.x - rect.startCenter.x) * progress,
      y: rect.startCenter.y + (rect.endCenter.y - rect.startCenter.y) * progress,
    };
    return center;
  }

  #getTop(rect, time) {
    if (!rect) return 0;
    return this.#getCenter(rect, time).y + rect.height / 2;
  }

  #getLeft(rect, time) {
    if (!rect) return 0;
    return this.#getCenter(rect, time).x - rect.width / 2;
  }

  #setBallPosition(ballPos) {
    if (!this.#ballEl || !ballPos) return;
    const newX = this.#gameState.width / 2 + ballPos.x - this.#gameState.ball.width / 2;
    this.#ballEl.setAttribute('x', newX);
    const newY = this.#gameState.height / 2 - ballPos.y - this.#gameState.ball.height / 2;
    this.#ballEl.setAttribute('y', newY);
  }

  #setPaddleLeftPosition(paddlePos) {
    if (!this.#paddleLeftEl || !paddlePos) return;
    const newX = this.#gameState.width / 2 + paddlePos.x - this.#gameState.paddleLeft.width / 2;
    this.#paddleLeftEl.setAttribute('x', newX);
    const newY = this.#gameState.height / 2 - paddlePos.y - this.#gameState.paddleLeft.height / 2;
    this.#paddleLeftEl.setAttribute('y', newY);
  }

  #setPaddleRightPosition(paddlePos) {
    if (!this.#paddleRightEl || !paddlePos) return;
    const newX = this.#gameState.width / 2 + paddlePos.x - this.#gameState.paddleRight.width / 2;
    this.#paddleRightEl.setAttribute('x', newX);
    const newY = this.#gameState.height / 2 - paddlePos.y - this.#gameState.paddleRight.height / 2;
    this.#paddleRightEl.setAttribute('y', newY);
  }
}

customElements.define('game-renderer-2d', GameRenderer2D);
