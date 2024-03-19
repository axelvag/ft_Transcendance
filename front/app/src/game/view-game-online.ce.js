import { redirectTo } from '@/router.js';
import { getProfile } from '@/auth.js';

class ViewGameOnline extends HTMLElement {
  #game;
  #user;
  #playerLeft;
  #playerRight;

  constructor() {
    super();
    this.getPlayerProfile = this.getPlayerProfile.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.handleError = this.handleError.bind(this);

    this.#user = getProfile();
  }

  async connectedCallback() {
    if (!this.hasAttribute('game-id')) {
      this.handleError('No game id provided');
      return;
    }

    const gameId = this.getAttribute('game-id');
    try {
      this.#game = await fetch(`http://127.0.0.1:8009/games/${gameId}`).then(res => res.json());
      this.#playerLeft = await this.getPlayerProfile(this.#game.player_left_id);
      this.#playerRight = await this.getPlayerProfile(this.#game.player_right_id);

      this.innerHTML = `<game-dialog></game-dialog>`;
      const gameDialog = this.querySelector('game-dialog');
      gameDialog.render({
        open: true,
        players: {
          playerLeft: this.#playerLeft,
          playerRight: this.#playerRight,
        },
        title: 'Ready?',
      });
      setTimeout(this.joinGame, 3000);
    } catch (error) {
      this.handleError(error);
    }
  }

  disconnectedCallback() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async getPlayerProfile(playerId) {
    if (String(this.#user.id) === String(playerId)) {
      return {
        id: String(this.#user.id),
        name: this.#user.username,
        avatar: this.#user.avatar,
        type: 'you',
      };
    }

    const profile = await fetch(`http://127.0.0.1:8002/get_user_profile/${playerId}`).then(res => res.json());
    return {
      id: String(profile.id),
      name: profile.username,
      avatar: profile.avatar || '/assets/img/default-profile.jpg',
      type: '',
    };
  }

  async joinGame() {
    this.ws = new WebSocket(`ws://127.0.0.1:8009/play/${this.#game.id}/${this.#user.id}`);
    this.ws.onmessage = this.handleMessage;
    this.ws.onerror = this.handleError;
    this.ws.onopen = () => console.log('ws play opened');
    this.ws.onclose = () => console.log('ws play closed');
  }

  handleMessage(e) {
    try {
      const data = JSON.parse(e.data);
      console.log('ws', data);
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error(error);
    alert('An error occured. Please try again.');
    redirectTo('/game');
  }
}

customElements.define('view-game-online', ViewGameOnline);
