import './components/game-select-player.ce.js';
import './components/game-play.ce.js';
import { redirectTo } from '@/router.js';
import { characters } from './utils/characters.js';
import { isAuthenticated, getProfile } from '@/auth.js';

class ViewGameOffline extends HTMLElement {
  #playerLeft = null;
  #playerRight = null;
  #duo = false;

  constructor() {
    super();
    this.displayPlayerLeftSelect = this.displayPlayerLeftSelect.bind(this);
    this.displayPlayerRightSelect = this.displayPlayerRightSelect.bind(this);
    this.displayGame = this.displayGame.bind(this);
  }

  async connectedCallback() {
    this.#duo = this.hasAttribute('duo');

    const isLoggedIn = await isAuthenticated();
    let profile = null;
    if (isLoggedIn) {
      profile = await getProfile();
      this.#playerLeft = {
        id: profile.id,
        name: profile.username,
        avatar: profile.avatar,
        type: this.#duo ? '' : 'you',
      };
    } else {
      this.#playerLeft = {
        ...characters[0],
        type: this.#duo ? '' : 'you',
      };
    }
    this.#playerRight = {
      ...characters[1],
      type: this.#duo ? '' : 'ai',
    };
    this.displayPlayerLeftSelect();
  }

  displayPlayerLeftSelect() {
    this.innerHTML = `
      <game-select-player
        id="gameOffline-select-left"
        title="${this.#duo ? 'Choose Player Left' : 'Choose your character'}"
        selected-id="${this.#playerLeft?.id}"
        type="${this.#playerLeft?.type}"
      ></game-select-player>
    `;

    const playerLeftSelect = this.querySelector('#gameOffline-select-left');
    playerLeftSelect.onCancel = () => redirectTo('/game');
    playerLeftSelect.onSelect = newValue => {
      this.#playerLeft = newValue;
      this.displayPlayerRightSelect();
    };
  }

  displayPlayerRightSelect() {
    this.innerHTML = `
      <game-select-player
        id="gameOffline-select-right"
        title="${this.#duo ? 'Choose Player Right' : 'Choose your adversary'}"
        direction="right"
        selected-id="${this.#playerRight?.id}"
        type="${this.#playerRight?.type}"
      ></game-select-player>
    `;

    const playerLeftSelect = this.querySelector('#gameOffline-select-right');
    playerLeftSelect.onCancel = this.displayPlayerLeftSelect;
    playerLeftSelect.onSelect = newValue => {
      this.#playerRight = newValue;
      this.displayPlayers();
    };
  }

  displayPlayers() {
    this.innerHTML = `
      <game-dialog></game-dialog>
    `;

    const gameDialog = this.querySelector('game-dialog');
    gameDialog.render({
      open: true,
      back: {
        action: this.displayPlayerRightSelect,
      },
      players: {
        playerLeft: this.#playerLeft,
        playerRight: this.#playerRight,
      },
      title: 'Ready?',
      controls: [
        {
          icon: 'play',
          action: this.displayGame,
          large: true,
        },
      ],
    });
  }

  displayGame() {
    this.innerHTML = `
      <game-play
        player-left-id="${this.#playerLeft.id}"
        player-left-name="${this.#playerLeft.name}"
        player-left-avatar="${this.#playerLeft.avatar}"
        player-left-type="${this.#playerLeft.type}"
        player-right-id="${this.#playerRight.id}"
        player-right-name="${this.#playerRight.name}"
        player-right-avatar="${this.#playerRight.avatar}"
        player-right-type="${this.#playerRight.type}"
      ></game-play>
    `;
  }
}

customElements.define('view-game-offline', ViewGameOffline);
