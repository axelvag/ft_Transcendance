const style = `
:host {
  display: block;
}
.gamePlayer {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75em;
  position: relative;
}
.gamePlayer.is-left {
  left: 0;
}
.gamePlayer.is-right {
  right: 0;
}

.gamePlayer-avatar {
  flex: 0 0 auto;
  width: 8em;
  height: 8em;
  border: 0.25em solid var(--bs-primary);
  background: #fff;
  border-radius: 100%;
  overflow: hidden;
  position: relative;
}
.gamePlayer-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gamePlayer-avatar img:error {
  display: none;
}
.gamePlayer.is-right .gamePlayer-avatar {
  transform: scale(-1, 1);
  border-color: var(--bs-secondary);
}
.gamePlayer.is-winner .gamePlayer-avatar {
  margin: 0 1em 1em;
}

.gamePlayer-crown {
  display: none;

  color: gold;
  font-size: 9.75em;

  position: absolute;
  z-index: 1;
  top: 0;
  left: 50%;
  margin-top: -0.17em;
  margin-left: -0.007em;
  transform: translateX(-50%);
}
.gamePlayer.is-winner .gamePlayer-crown {
  display: block;
}

.gamePlayer-details {
  flex: 1 1 auto;
  max-width: 20em;
  position: relative;
  z-index: 2;
}

.gamePlayer-name {
  font-size: 1.25em;
  line-height: 1.5;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gamePlayer-score {
  display: flex;
  gap: 0.375em;
  margin-top: 0.75em;
}
.gamePlayer.is-right .gamePlayer-score {
  flex-direction: row-reverse;
}

.gamePlayer-score-point {
  flex: 0 0 auto;
  width: 1em;
  height: 1em;
  border-radius: 0.125em;
  background: var(--bs-gray-900);
}

.gamePlayer-score-point.is-active {
  background: var(--bs-primary);score-max
}
.gamePlayer.is-right .gamePlayer-score-point.is-active {
  background: var(--bs-secondary);
}
`;

if (!document.querySelector('#gamePlayer-style')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'gamePlayer-style';
  styleEl.textContent = style;
  document.head.appendChild(styleEl);
}

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
