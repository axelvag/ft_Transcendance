import './game-player.ce.scss';

class GamePlayer extends HTMLElement {
  #attrs = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.#attrs.avatar = this.getAttribute('avatar');
    this.#attrs.name = this.getAttribute('name');
    this.#attrs.score = this.getAttribute('score');
    this.#attrs['score-max'] = this.getAttribute('score-max');
    this.#attrs.direction = this.getAttribute('direction');

    this.#render();
  }

  static get observedAttributes() {
    return ['avatar', 'name', 'score', 'score-max', 'direction', 'winner'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.#attrs[name] = newValue;

    if (!this.querySelector('.gamePlayer')) return;

    if (name === 'avatar') {
      this.querySelector('.gamePlayer-avatar img').src = newValue || '';
    } else if (name === 'name') {
      this.querySelector('.gamePlayer-name').textContent = newValue;
    } else if (name === 'score' || name === 'score-max') {
      this.#renderScore();
    } else if (name === 'direction') {
      this.querySelector('.gamePlayer').classList.remove('is-left', 'is-right');
      this.querySelector('.gamePlayer').classList.add(`is-${this.#getSide()}`);
    } else if (name === 'winner') {
      if (newValue != null) {
        this.querySelector('.gamePlayer').classList.add('is-winner');
      } else {
        this.querySelector('.gamePlayer').classList.remove('is-winner');
      }
    }
  }

  #getSide() {
    return this.#attrs.direction === 'right' ? 'right' : 'left';
  }

  #render() {
    this.innerHTML = `
      <div class="gamePlayer is-${this.#getSide()}">
        <div class="gamePlayer-avatar">
          <img src="${this.#attrs.avatar}" />
        </div>
        <ui-icon name="crown" class="gamePlayer-crown"></ui-icon>
        <div class="gamePlayer-details">
          <div class="gamePlayer-name">${this.#attrs.name || ''}</div>
          <div class="gamePlayer-score"></div>
        </div>
      </div>
    `;

    this.#renderScore();
  }

  #renderScore() {
    const scoreEl = this.querySelector('.gamePlayer-score');
    if (!scoreEl) return;

    const getPointHtml = isActive => `<div class="gamePlayer-score-point ${isActive ? 'is-active' : ''}"></div>`;
    let scoreHtml = '';
    for (let i = 0; i < this.#attrs['score-max']; i++) {
      scoreHtml += getPointHtml(i < this.#attrs.score);
    }
    scoreEl.innerHTML = scoreHtml;
  }
}

customElements.define('game-player', GamePlayer);
