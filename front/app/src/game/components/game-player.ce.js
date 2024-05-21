import './game-player.ce.scss';

class GamePlayer extends HTMLElement {
  #attrs = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.#attrs.avatar = this.getAttribute('avatar');
    this.#attrs.name = this.getAttribute('name');
    this.#attrs.type = this.getAttribute('type');
    this.#attrs.score = this.getAttribute('score');
    this.#attrs['score-max'] = this.getAttribute('score-max');
    this.#attrs.direction = this.getAttribute('direction');
    this.#attrs['flip-avatar'] = this.getAttribute('flip-avatar');

    this.#render();
  }

  static get observedAttributes() {
    return ['avatar', 'name', 'type', 'score', 'score-max', 'direction', 'flip-avatar', 'winner'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.#attrs[name] = newValue;

    if (!this.querySelector('.gamePlayer')) return;

    if (name === 'avatar') {
      this.querySelector('.gamePlayer-avatar img').src = newValue || '';
    } else if (name === 'name') {
      this.querySelector('.gamePlayer-name').textContent = newValue;
    } else if (name === 'type') {
      this.querySelector('.gamePlayer-type').textContent = newValue || '';
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
    } else if (name === 'flip-avatar') {
      if (newValue != null) {
        this.querySelector('.gamePlayer').classList.add('is-flip-avatar');
      } else {
        this.querySelector('.gamePlayer').classList.remove('is-flip-avatar');
      }
    }
  }

  #getSide() {
    return this.#attrs.direction === 'right' ? 'right' : 'left';
  }

  #render() {
    const directionClass = `is-${this.#getSide()}`;
    const flipAvatarClass = this.#attrs['flip-avatar'] != null ? 'is-flip-avatar' : '';

    this.innerHTML = `
      <div class="gamePlayer ${directionClass} ${flipAvatarClass}">
        <div class="gamePlayer-avatar">
          <div class="gamePlayer-avatar-img">
            <img src="${this.#attrs.avatar}" />
          </div>
          <span class="gamePlayer-type">${this.#attrs.type || ''}</span>
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
