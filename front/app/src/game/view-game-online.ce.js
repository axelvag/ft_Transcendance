import './components/game-matchup.ce.js';
import './components/game-play.ce.js';
import { getProfile } from '@/auth.js';
import { notifyError } from '@/notifications.js';
import { redirectTo } from '@/router.js';
import { BASE_URL } from '@/constants.js';

class ViewGameOnline extends HTMLElement {
  #backRoute;
  #game;
  #user;
  #playerLeft;
  #playerRight;

  constructor() {
    super();

    this.getPlayerProfile = this.getPlayerProfile.bind(this);
    this.displayGameNotFound = this.displayGameNotFound.bind(this);
    this.displayGameRecord = this.displayGameRecord.bind(this);
    this.displayGamePlay = this.displayGamePlay.bind(this);

    this.#user = getProfile();
    this.#user.id = String(this.#user.id);

    this.#backRoute = '/dashboard';
    if (this.hasAttribute('back-route')) {
      this.#backRoute = this.getAttribute('back-route');
    }
  }

  async connectedCallback() {
    this.innerHTML = `<div class="vh-100 halo-bicolor"></div>`;

    try {
      if (!this.hasAttribute('game-id')) throw new Error('game-id required');
      this.#game = await fetch(`${BASE_URL}:8009/games/${this.getAttribute('game-id')}`, {
        credentials: 'include',
      }).then(res => res.json());
    } catch (error) {
      this.displayGameNotFound();
    }

    try {
      this.#playerLeft = await this.getPlayerProfile(this.#game.player_left_id);
      this.#playerRight = await this.getPlayerProfile(this.#game.player_right_id);

      if (['FINISHED', 'ABORTED'].includes(this.#game.status)) {
        this.displayGameRecord();
      } else {
        this.displayGamePlay();
      }
    } catch (error) {
      console.error(error);
      notifyError('An error occurred. Please try again later.');
      redirectTo(this.#backRoute);
    }
  }

  disconnectedCallback() {}

  async getPlayerProfile(playerId) {
    playerId = String(playerId);
    if (this.#user.id === playerId) {
      return {
        id: playerId,
        name: this.#user.username,
        avatar: this.#user.avatar,
        type: 'you',
      };
    }

    const profile = await fetch(`${BASE_URL}:8002/get_user_profile/${playerId}/`, {
      credentials: 'include',
    }).then(res => res.json());

    return {
      id: playerId,
      name: profile.username,
      avatar: profile.avatar || '/assets/img/default-profile.jpg',
      type: '',
    };
  }

  displayGameRecord() {
    // title
    const title = `
      ${this.#game.player_left_score}${this.#game.player_left_forfeit ? ' (forfeit)' : ''}
      -
      ${this.#game.player_right_score}${this.#game.player_right_forfeit ? ' (forfeit)' : ''}
    `;

    // details
    let details = `
      <span class="badge text-bg-success" style="font-size: 0.875em;">${this.#game.status}</span>
      <div style="height:0.25em;"></div>
    `;

    let winner = null;
    if (this.#playerLeft.id === this.#game.winner_id) {
      winner = this.#playerLeft;
    } else if (this.#playerRight.id === this.#game.winner_id) {
      winner = this.#playerRight;
    }
    if (winner) {
      details += `
        <span>
          Won by <b>${winner.name}</b>
          on <b>${this.formatDateTime(this.#game.ended_at)}</b>
        </span>
      `;
    } else {
      details += `
        <span>
          Ended on <b>${this.formatDateTime(this.#game.ended_at)}</b>
        </span>
      `;
    }

    this.innerHTML = `
      <game-matchup
        back-route="${this.#backRoute}"
        player-left-id="${this.#playerLeft.id}"
        player-left-name="${this.#playerLeft.name}"
        player-left-avatar="${this.#playerLeft.avatar}"
        player-left-type="${this.#playerLeft.type}"
        player-left-wins="${this.#playerLeft.id === this.#game.winner_id}"
        player-right-id="${this.#playerRight.id}"
        player-right-name="${this.#playerRight.name}"
        player-right-avatar="${this.#playerRight.avatar}"
        player-right-type="${this.#playerRight.type}"
        player-left-wins="${this.#playerRight.id === this.#game.winner_id}"
        title="${title}"
        details='${details}'
      ></game-matchup>
    `;
  }

  displayGameNotFound() {
    this.innerHTML = `
      <div class="vh-100 halo-bicolor d-flex flex-columns align-items-center justify-content-center overflow-auto">
        <div class="w-100 text-center p-5 flex-shrink-0">
          <h1 class="mb-4">Game Online</h1>
          <p class="mb-4">This game does not exist or you are not allowed to play it.</p>
          <p class="py-2">
            <a class="btn btn-primary" data-link="/">Back to Dashboard</a>
          </p>
        </div>
      </div>
    `;
  }

  displayGamePlay() {
    this.innerHTML = `
      <game-play
        game-id="${this.#game.id}"
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

  formatDateTime(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}

customElements.define('view-game-online', ViewGameOnline);
