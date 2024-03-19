import { redirectTo } from '@/router.js';
import { getProfile } from '@/auth.js';
import { getCsrfToken } from '@/auth.js';

class ViewGameOnline extends HTMLElement {
  #user;
  #playerLeft;
  #playerRight;

  constructor() {
    super();
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
      const game = await fetch(`http://127.0.0.1:8009/games/${gameId}`).then(res => res.json());
      this.#playerLeft = await this.getPlayerProfile(game.player_left_id);
      this.#playerRight = await this.getPlayerProfile(game.player_right_id);

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
      console.log({
        playerLeft: this.#playerLeft,
        playerRight: this.#playerRight,
      });
    } catch (error) {
      this.handleError(error);
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

  handleError(error) {
    console.error(error);
    alert('Game not found');
    redirectTo('/game');
  }
}

customElements.define('view-game-online', ViewGameOnline);
