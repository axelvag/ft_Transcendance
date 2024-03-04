import './game-renderer-2d.ce.js';
import GameWorker from '../localApi/GameWorker.js?worker';
import calculateNextAiPosition from '../localApi/calculateNextAiPosition.js';

const template = `
<div class="gameDemo" hidden>
  <game-renderer-2d class="gameDemo-renderer"></game-renderer-2d>
</div>
`;

class GameDemo extends HTMLElement {
  #gameState = null;
  #playerLeft = {};
  #playerRight = {};
  #aiInterval = null;

  constructor() {
    super();

    this.handleInitMessage = this.handleInitMessage.bind(this);
    this.handleUpdateMessage = this.handleUpdateMessage.bind(this);

    this.gameWorker = new GameWorker();
  }

  connectedCallback() {
    this.innerHTML = template;

    // Players
    this.#playerLeft = {
      type: 'ai',
    };
    this.#playerRight = {
      type: 'ai',
    };

    // Renderer
    this.rendererEl = this.querySelector('.gameDemo-renderer');

    // Game events
    this.gameWorker.onmessage = function (e) {
      const { type, data } = e.data || {};

      if (type === 'init') {
        this.handleInitMessage(data);
      } else if (type === 'update') {
        this.handleUpdateMessage(data);
      }
    };
    this.gameWorker.onmessage = this.gameWorker.onmessage.bind(this);

    // Game error
    this.gameWorker.onerror = function () {
      this.gameWorker.terminate();
    };
    this.gameWorker.onerror = this.gameWorker.onerror.bind(this);
  }

  disconnectedCallback() {
    this.gameWorker.postMessage({ type: 'reset' });
    this.gameWorker.terminate();

    // clear interval
    clearInterval(this.#aiInterval);
  }

  handleInitMessage(data) {
    const json = JSON.parse(data);
    // todo: validate data
    const dataState = json?.state;
    this.#gameState = {
      playerLeft: { ...this.#playerLeft },
      playerRight: { ...this.#playerRight },
      ...dataState,
    };
    this.rendererEl.init(this.#gameState);
    this.rendererEl.start();
    this.querySelector('.gameDemo').hidden = false;

    this.gameWorker.postMessage({ type: 'start' });

    // AI interval
    if (this.#playerLeft.type === 'ai' || this.#playerRight.type === 'ai') {
      const aiOptions = {
        waitForRebound: true,
        goToCenterOnWait: true,
        dirRandomness: 0.2,
      };
      this.#aiInterval = setInterval(() => {
        if (this.#playerLeft.type === 'ai') {
          const result = calculateNextAiPosition(this.#gameState, 'left', aiOptions);
          this.gameWorker.postMessage({ type: 'updatePaddleLeftMove', data: { targetY: result.targetY } });
        }
        if (this.#playerRight.type === 'ai') {
          const result = calculateNextAiPosition(this.#gameState, 'right', aiOptions);
          this.gameWorker.postMessage({ type: 'updatePaddleRightMove', data: { targetY: result.targetY } });
        }
      }, 1000);
    }
  }

  handleUpdateMessage(data) {
    const json = JSON.parse(data);
    // todo: validate data
    const updates = json?.state;
    this.#gameState = {
      ...this.#gameState,
      ...updates,
    };

    // renderer
    this.rendererEl.update(updates);
    if (updates.status === 'finished') {
      this.gameWorker.postMessage({ type: 'reset' });
      this.gameWorker.postMessage({ type: 'start' });
    }
  }
}

customElements.define('game-demo', GameDemo);
