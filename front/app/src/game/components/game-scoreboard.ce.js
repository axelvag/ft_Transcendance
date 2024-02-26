import './game-scoreboard.ce.scss';

class GameBoard extends HTMLElement {
  #attrs = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.#attrs.score = this.getAttribute('score-left');
    this.#attrs.score = this.getAttribute('score-right');

    this.innerHTML = `
      <div class="gameScoreboard">
        <div class="gameScoreboard-hr"></div>
        <div class="gameScoreboard-scores">
          <div class="gameScoreboard-score is-left">${this.#getScoreLeft()}</div>
          <div class="gameScoreboard-score-separator">:</div>
          <div class="gameScoreboard-score is-right">${this.#getScoreRight()}</div>
        </div>
        <div class="gameScoreboard-hr"></div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['score-left', 'score-right'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.#attrs[name] = newValue;

    if (!this.querySelector('.gameScoreboard')) return;

    if (name === 'score-left') {
      this.querySelector('.gameScoreboard-score.is-left').textContent = newValue;
    } else if (name === 'score-right') {
      this.querySelector('.gameScoreboard-score.is-right').textContent = newValue;
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
