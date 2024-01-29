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
    this.#attrs.right = this.getAttribute('right');

    this.#render();
  }

  static get observedAttributes() {
    return ['avatar', 'name', 'score', 'scoreMax'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.#attrs[name] = newValue;

    if (!this.querySelector('.game-player')) return;

    if (name === 'avatar') {
      this.querySelector('.game-player-avatar').src = newValue;
    } else if (name === 'name') {
      this.querySelector('.game-player-name').textContent = newValue;
    } else if (name === 'score' || name === 'score-max') {
      this.#renderScore();
    } else if (name === 'right') {
      this.querySelector('.game-player').classList.remove('is-left', 'is-right').add(`is-${this.#getSide()}`);
    }
  }

  #getSide() {
    return this.#attrs.right != null ? 'right' : 'left';
  }

  #render() {
    this.innerHTML = `
      <style>
        .game-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }
        .game-player.is-left {
          left: 0;
        }
        .game-player.is-right {
          right: 0;
        }
        
        .game-player-avatar {
          flex: 0 0 auto;
          display: block;
          width: 8rem;
          height: 8rem;
          object-fit: cover;
          border: 0.25rem solid var(--bs-primary);
          background: #fff;
          border-radius: 100%;
          
        }
        .game-player.is-right .game-player-avatar {
          border-color: var(--bs-secondary);
        }

        .game-player-details {
          flex: 1 1 auto;
          max-width: 20rem;
        }
        
        .game-player-name {
          font-size: 1.25rem;
          line-height: 2rem;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .game-player-score {
          display: flex;
          gap: 0.375rem;
          margin-top: 0.75rem;
        }
        .game-player.is-right .game-player-score {
          flex-direction: row-reverse;
        }

        .game-player-score-point {
          flex: 0 0 auto;
          width: 1rem;
          height: 1rem;
          border-radius: 0.125rem;
          background: var(--bs-gray-900);
        }

        .game-player-score-point.is-active {
          background: var(--bs-primary);
        }
        .game-player.is-right .game-player-score-point.is-active {
          background: var(--bs-secondary);
        }
      </style>
      <div class="game-player is-${this.#getSide()}">
        <img class="game-player-avatar" src="${this.#attrs.avatar}" />
        <div class="game-player-details">
          <div class="game-player-name">${this.#attrs.name}</div>
          <div class="game-player-score"></div>
        </div>
      </div>
    `;

    this.#renderScore();
  }

  #renderScore() {
    const scoreEl = this.querySelector('.game-player-score');
    if (!scoreEl) return;

    const getPointHtml = isActive => `<div class="game-player-score-point ${isActive ? 'is-active' : ''}"></div>`;
    let scoreHtml = '';
    for (let i = 0; i < this.#attrs['score-max']; i++) {
      scoreHtml += getPointHtml(i < this.#attrs.score);
    }
    scoreEl.innerHTML = scoreHtml;
  }
}

customElements.define('game-player', GamePlayer);
