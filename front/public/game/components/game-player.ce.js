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
    return ['avatar', 'name', 'score', 'score-max', 'direction'];
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
    }
  }

  #getSide() {
    return this.#attrs.direction === 'right' ? 'right' : 'left';
  }

  #render() {
    this.innerHTML = `
      <style>
        .gamePlayer {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }
        .gamePlayer.is-left {
          left: 0;
        }
        .gamePlayer.is-right {
          right: 0;
        }
        
        .gamePlayer-avatar {
          flex: 0 0 auto;
          width: 8rem;
          height: 8rem;
          border: 0.25rem solid var(--bs-primary);
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
        .gamePlayer.is-right .gamePlayer-avatar {
          transform: scale(-1, 1);
          border-color: var(--bs-secondary);
        }

        .gamePlayer-details {
          flex: 1 1 auto;
          max-width: 20rem;
        }
        
        .gamePlayer-name {
          font-size: 1.25rem;
          line-height: 2rem;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gamePlayer-score {
          display: flex;
          gap: 0.375rem;
          margin-top: 0.75rem;
        }
        .gamePlayer.is-right .gamePlayer-score {
          flex-direction: row-reverse;
        }

        .gamePlayer-score-point {
          flex: 0 0 auto;
          width: 1rem;
          height: 1rem;
          border-radius: 0.125rem;
          background: var(--bs-gray-900);
        }

        .gamePlayer-score-point.is-active {
          background: var(--bs-primary);score-max
        }
        .gamePlayer.is-right .gamePlayer-score-point.is-active {
          background: var(--bs-secondary);
        }
      </style>
      <div class="gamePlayer is-${this.#getSide()}">
        <div class="gamePlayer-avatar">
          <img src="${this.#attrs.avatar}" onerror='this.style.display = "none"' />
        </div>
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
