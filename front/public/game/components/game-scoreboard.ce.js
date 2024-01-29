class GameBoard extends HTMLElement {
  #attrs = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.#attrs.score = this.getAttribute('score-left');
    this.#attrs.score = this.getAttribute('score-right');

    this.innerHTML = `
      <style>
        .game-scoreboard {
          font-family: 'Orbitron', sans-serif;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .game-scoreboard-scores {
          display: flex;
          align-items: center;
        }
        .game-scoreboard-score {
          flex: 0 0 auto;
          font-size: 3rem;
          line-height: 1;
          padding: 0.25rem 0 0.375rem;
          min-width: 5rem;
        }
        .game-scoreboard-score-separator {
          flex: 0 0 auto;
          font-size: 2rem;
          line-height: 1;
          margin-top: -0.2em;
          padding: 0 0.75rem;
        }
        .game-scoreboard-hr {
          height: 2px;
          width: 20rem;
          background: linear-gradient(to right, var(--bs-primary), var(--bs-secondary));
          margin: 0.25rem 0;
          border-radius: 100%;
          filter: blur(1px) opacity(0.75);
        }
      </style>
      <div class="game-scoreboard">
        <div class="game-scoreboard-hr"></div>
        <div class="game-scoreboard-scores">
          <div class="game-scoreboard-score is-left">${this.#getScoreLeft()}</div>
          <div class="game-scoreboard-score-separator">:</div>
          <div class="game-scoreboard-score is-right">${this.#getScoreRight()}</div>
        </div>
        <div class="game-scoreboard-hr"></div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['score-left', 'score-right'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.#attrs[name] = newValue;

    if (!this.querySelector('.game-scoreboard')) return;

    if (name === 'score-left') {
      this.querySelector('.game-scoreboard-score.is-left').textContent = newValue;
    } else if (name === 'score-right') {
      this.querySelector('.game-scoreboard-score.is-right').textContent = newValue;
    }
  }

  #getScoreLeft() {
    return Number(this.#attrs['score-left'] || 0);
  }

  #getScoreRight() {
    return Number(this.#attrs['score-right'] || 0);
  }
}

customElements.define('game-scoreboard', GameBoard);
