import { redirectTo } from '@/router.js';
import { getProfile } from '@/auth.js';
import { getCsrfToken } from '@/auth.js';

class ViewGameOnline extends HTMLElement {
  #playerLeft;
  #playerRight;

  constructor() {
    super();
    this.handleError = this.handleError.bind(this);
  }

  async connectedCallback() {
    if (!this.hasAttribute('game-id')) {
      this.handleError('No game id provided');
      return;
    }

    const gameId = this.getAttribute('game-id');
    try {
      const game = await fetch(`http://127.0.0.1:8009/games/${gameId}`).then(res => res.json());
      this.#playerLeft = await this.getPlayerProfile(game.player1_id);
      this.#playerRight = await this.getPlayerProfile(game.player2_id);

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
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPlayerProfile(playerId) {
    // todo: implement profile fetching
    const user = getProfile();
    const isYou = String(user.id) === String(playerId);
    const profile = await fetch(`http://127.0.0.1:8001/accounts/get_profile/${playerId}`).then(res => res.json());
    return {
      id: String(profile.id),
      name: profile.username,
      avatar: isYou ? user.avatar : 'assets/img/default-profile.jpg',
      type: isYou ? 'you' : '',
    };
  }

  handleError(error) {
    console.error(error);
    alert('Game not found');
    redirectTo('/game');
  }
}

customElements.define('view-game-online', ViewGameOnline);
