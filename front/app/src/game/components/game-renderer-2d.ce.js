class GameRenderer2D extends HTMLElement {
  #isReady = false;
  #gameState = null;
  #animationId = null;

  #ballEl = null;
  #paddleLeftEl = null;
  #paddleRightEl = null;

  constructor() {
    super();
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
    this.innerHTML = `
      <svg
        class="w-100 h-100 user-select-none"
        viewBox="0 0 ${this.#gameState.width} ${this.#gameState.height}"
      >
        <defs>
          <clipPath id="gameRenderer2D-mask">
            <rect
              x="0"
              y="0"
              width="${this.#gameState.width}"
              height="${this.#gameState.height}"
              rx="${this.#gameState.wallThickness * 2.5}"
            />
          </clipPath>
        </defs>
        
        <g clip-path="url(#gameRenderer2D-mask)">

          <!-- Background -->
          <rect
            x="0"
            y="0"
            width="${this.#gameState.width}"
            height="${this.#gameState.height}"
            fill="var(--bs-body-bg)"
          />
        
          <!-- Middle line -->
          <line
            x1="${this.#gameState.width / 2}"
            y1="${this.#gameState.wallThickness}"
            x2="${this.#gameState.width / 2}"
            y2="${this.#gameState.height - this.#gameState.wallThickness}"
            stroke-width="4"
            stroke-dasharray="4, 6"
            stroke="var(--bs-gray-900)"
          />

          <!-- Ball -->
          <rect
            id="gameRenderer2D-ball"
            x="${this.#gameState.width / 2 + this.#getLeft(this.#gameState.ball)}"
            y="${this.#gameState.height / 2 - this.#getTop(this.#gameState.ball)}"
            width="${this.#gameState.ball.width}"
            height="${this.#gameState.ball.height}"
            fill="var(--bs-body-color)"
          />

          <!-- Left paddle -->
          <rect
            id="gameRenderer2D-paddle-left"
            x="${this.#gameState.width / 2 + this.#getLeft(this.#gameState.paddleLeft)}"
            y="${this.#gameState.height / 2 - this.#getTop(this.#gameState.paddleLeft)}"
            width="${this.#gameState.paddleLeft.width}"
            height="${this.#gameState.paddleLeft.height}"
            fill="var(--bs-primary)"
          />

          <!-- Right paddle -->
          <rect
            id="gameRenderer2D-paddle-right"
            x="${this.#gameState.width / 2 + this.#getLeft(this.#gameState.paddleRight)}"
            y="${this.#gameState.height / 2 - this.#getTop(this.#gameState.paddleRight)}"
            width="${this.#gameState.paddleRight.width}"
            height="${this.#gameState.paddleRight.height}"
            fill="var(--bs-secondary)"
          />
        
          <!-- Walls -->
          <rect
            x="${this.#gameState.wallThickness / 2}"
            y="${this.#gameState.wallThickness / 2}"
            rx="${this.#gameState.wallThickness * 2}"
            width="${this.#gameState.width - this.#gameState.wallThickness}"
            height="${this.#gameState.height - this.#gameState.wallThickness}"
            stroke-width="${this.#gameState.wallThickness}"
            stroke="var(--bs-gray-900)"
            fill="transparent"
          />

        </g>
      </svg>
    `;

    // Elements
    this.#ballEl = this.querySelector('#gameRenderer2D-ball');
    this.#paddleLeftEl = this.querySelector('#gameRenderer2D-paddle-left');
    this.#paddleRightEl = this.querySelector('#gameRenderer2D-paddle-right');

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
