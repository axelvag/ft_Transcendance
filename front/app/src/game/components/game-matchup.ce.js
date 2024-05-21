import './game-matchup.ce.scss';
import './game-player.ce.js';
import { enterFullscreen, exitFullscreen } from '@/fullscreen.js';
import { selectTheme } from '@/theme.js';

class GameMatchup extends HTMLElement {
  #backRoute;
  #playerLeft = {};
  #playerRight = {};

  constructor() {
    super();

    this.renderBackRoute = this.renderBackRoute.bind(this);
    this.renderPlayers = this.renderPlayers.bind(this);
    this.renderDetails = this.renderDetails.bind(this);
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="gameMatchup">
        <div class="gameMatchup-nav">

          <!-- Back -->
          <button class="gameMatchup-nav-item gameMatchup-back">
            <ui-icon name="arrow-left"></ui-icon>
          </button>

          <!-- Spacer -->
          <div class="gameMatchup-nav-spacer"></div>

          <!-- Theme -->
          <button class="gameMatchup-nav-item dark-hidden gameMatchup-theme-dark">
            <ui-icon name="sun"></ui-icon>
          </button>
          <button class="gameMatchup-nav-item dark-visible gameMatchup-theme-light">
            <ui-icon name="moon"></ui-icon>
          </button>

          <!-- Fullscreen -->
          <button class="gameMatchup-nav-item fullscreen-hidden gameMatchup-enterFullscreen">
            <ui-icon name="expand"></ui-icon>
          </button>
          <button class="gameMatchup-nav-item fullscreen-visible gameMatchup-exitFullscreen">    
            <ui-icon name="collapse"></ui-icon>
          </button>

        </div>

        <div class="gameMatchup-players">
          <game-player class="gameMatchup-player is-left"></game-player>
          <div class="gameMatchup-players-separator text-bicolor">vs</div>
          <game-player class="gameMatchup-player is-right"></game-player>
        </div>
        
        <div class="gameMatchup-details">
          <div class="gameMatchup-details-inner">
            <div class="gameMatchup-details-title"></div>
            <div class="gameMatchup-details-body"></div>
          </div>
        </div>
      </div>
    `;

    this.querySelector('.gameMatchup-enterFullscreen').addEventListener('click', enterFullscreen);
    this.querySelector('.gameMatchup-exitFullscreen').addEventListener('click', exitFullscreen);
    this.querySelector('.gameMatchup-theme-dark').addEventListener('click', () => selectTheme('dark'));
    this.querySelector('.gameMatchup-theme-light').addEventListener('click', () => selectTheme('light'));

    this.renderBackRoute();
    this.renderPlayers();
    this.renderDetails();
  }

  disconnectedCallback() {}

  static get observedAttributes() {
    return [
      'back-route',
      'player-left-id',
      'player-left-name',
      'player-left-avatar',
      'player-left-type',
      'player-left-wins',
      'player-right-id',
      'player-right-name',
      'player-right-avatar',
      'player-right-type',
      'player-right-wins',
      'title',
      'details',
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'back-route':
        this.renderBackRoute();
        break;
      case 'player-left-id':
      case 'player-left-name':
      case 'player-left-avatar':
      case 'player-left-type':
      case 'player-left-wins':
      case 'player-right-id':
      case 'player-right-name':
      case 'player-right-avatar':
      case 'player-right-type':
      case 'player-right-wins':
        this.renderPlayers();
        break;
      case 'title':
      case 'details':
        this.renderDetails();
        break;
    }
  }

  renderBackRoute() {
    this.#backRoute = this.getAttribute('back-route');
    const backEl = this.querySelector('.gameMatchup-back');
    if (backEl) {
      if (this.#backRoute) {
        backEl.hidden = false;
        backEl.setAttribute('data-link', this.#backRoute);
      } else {
        backEl.hidden = true;
        backEl.removeAttribute('data-link');
      }
    }
  }

  renderPlayers() {
    // player left
    this.#playerLeft.id = this.getAttribute('player-left-id');
    this.#playerLeft.name = this.getAttribute('player-left-name');
    this.#playerLeft.avatar = this.getAttribute('player-left-avatar');
    this.#playerLeft.type = this.getAttribute('player-left-type');
    this.#playerLeft.wins = this.hasAttribute('player-left-wins');

    this.playerLeftEl = this.querySelector('.gameMatchup-player.is-left');
    if (this.playerLeftEl) {
      this.playerLeftEl.setAttribute('name', this.#playerLeft.name);
      this.playerLeftEl.setAttribute('avatar', this.#playerLeft.avatar);
      if (this.#playerLeft.type) {
        this.playerLeftEl.setAttribute('type', this.#playerLeft.type);
      } else {
        this.playerLeftEl.removeAttribute('type');
      }
      if (this.#playerLeft.wins) {
        this.playerLeftEl.setAttribute('winner', true);
      } else {
        this.playerLeftEl.removeAttribute('winner');
      }
    }

    // player right
    this.#playerRight.id = this.getAttribute('player-right-id');
    this.#playerRight.name = this.getAttribute('player-right-name');
    this.#playerRight.avatar = this.getAttribute('player-right-avatar');
    this.#playerRight.type = this.getAttribute('player-right-type');
    this.#playerRight.wins = this.hasAttribute('player-right-wins');

    this.playerRightEl = this.querySelector('.gameMatchup-player.is-right');
    if (this.playerRightEl) {
      this.playerRightEl.setAttribute('direction', 'right');
      if (this.#playerRight.type === 'ai') {
        this.playerRightEl.setAttribute('flip-avatar', '');
      }
      this.playerRightEl.setAttribute('name', this.#playerRight?.name);
      this.playerRightEl.setAttribute('avatar', this.#playerRight?.avatar);
      this.playerRightEl.setAttribute('type', this.#playerRight?.type);
      if (this.#playerRight?.type) {
        this.playerRightEl.setAttribute('type', this.#playerRight.type);
      } else {
        this.playerRightEl.removeAttribute('type');
      }
      if (this.#playerRight.wins) {
        this.playerRightEl.setAttribute('winner', true);
      } else {
        this.playerRightEl.removeAttribute('winner');
      }
    }
  }

  renderDetails() {
    const detailsTitleEl = this.querySelector('.gameMatchup-details-title');
    if (detailsTitleEl) {
      detailsTitleEl.innerHTML = this.getAttribute('title') || '';
    }

    const detailsBodyEl = this.querySelector('.gameMatchup-details-body');
    if (detailsBodyEl) {
      detailsBodyEl.innerHTML = this.getAttribute('details') || '';
    }
  }
}

customElements.define('game-matchup', GameMatchup);
