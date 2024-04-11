import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { getProfile, getCsrfToken } from '@/auth.js';

class ViewGameOnline extends HTMLElement {
  #game;
  #user;
  #playerLeft;
  #playerRight;
  #ws;

  constructor() {
    super();
    this.getPlayerProfile = this.getPlayerProfile.bind(this);
    this.displayMatchup = this.displayMatchup.bind(this);
    this.renderGame = this.renderGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.displayGameNotFound = this.displayGameNotFound.bind(this);

    this.#user = getProfile();
    this.#user.id = String(this.#user.id);
  }

  async connectedCallback() {
    this.innerHTML = `
      <default-layout-main>
        <div class="text-center">
          <h1 class="mb-4">Game Online</h1>
          <div id="viewGameOnline-body"></div>
        </div>
      </default-layout-main>
    `;

    if (this.hasAttribute('game-id')) {
      this.displayMatchup();
    } else {
      this.displayGameNotFound();
    }
  }

  disconnectedCallback() {
    if (this.#ws) {
      this.#ws.close();
      this.#ws = null;
    }
  }

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

    const profile = await fetch(`http://127.0.0.1:8002/get_user_profile/${playerId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(res => res.getProfile);
    console.log('profile', profile.getProfile);
    return {
      id: playerId,
      name: profile.username,
      avatar: profile.avatar || '/assets/img/default-profile.jpg',
      type: '',
    };
  }

  async displayMatchup() {
    try {
      this.#game = await fetch(`http://127.0.0.1:8009/games/${this.getAttribute('game-id')}`).then(res => res.json());
      this.#playerLeft = await this.getPlayerProfile(this.#game.player_left_id);
      this.#playerRight = await this.getPlayerProfile(this.#game.player_right_id);
      console.log(this.#playerLeft, this.#playerRight);

      this.renderGame();

      if (this.#game.status === 'WAITING') {
        setTimeout(this.joinGame, 2000);
      }
    } catch (error) {
      this.displayGameNotFound();
    }
  }

  renderGame() {
    let gameHtml = `
      <div class="d-flex justify-content-center align-items-center my-5">
        <game-player
          name="${this.#playerLeft.name}"
          avatar="${this.#playerLeft.avatar}"
          type="${this.#playerLeft.type}"
          ${this.#game.winner_id === this.#game.player_left_id ? 'winner' : ''}
        ></game-player>
        <span class="mx-5 fs-3 fw-bold mb-5">VS</span>
        <game-player
          name="${this.#playerRight.name}"
          avatar="${this.#playerRight.avatar}"
          type="${this.#playerRight.type}"
          direction="right"
          ${this.#game.winner_id === this.#game.player_right_id ? 'winner' : ''}
        ></game-player>
      </div>
      <div class="mb-4">
        Status: ${this.#game.status}<br>
        Winner id: ${this.#game.winner_id}<br>
        Player left id: ${this.#game.player_left_id}<br>
        Player right id: ${this.#game.player_right_id}<br>
        Won by forfeit: ${this.#game.won_by_forfeit}<br>
        Created at: ${this.#game.created_at}<br>
        Ended at: ${this.#game.ended_at}<br>
      <div class="fw-bold text-secondary mb-4">
        ${this.#game.status}
      </div>
    `;
    if (this.#game.status !== 'WAITING') {
      gameHtml += `
        <div class="mb-4 fs-1 fw-semibold">
          ${this.#game.player_left_score} - ${this.#game.player_right_score}
        </div>
      `;
    }
    if (this.#ws && this.#game.status === 'READY') {
      gameHtml += `
        <div class="mb-4">
          <button id="viewGameOnline-endBtn" class="btn btn-secondary fw-semibold">CLICK TO WIN</button>
          <button class="btn btn-primary" data-link="/game">Leave</button>
        </div>
      `;
    } else {
      gameHtml += `
        <div class="mb-4">
          <button class="btn btn-primary" data-link="/game">Leave</button>
        </div>
      `;
    }

    this.querySelector('#viewGameOnline-body').innerHTML = gameHtml;

    const endBtn = this.querySelector('#viewGameOnline-endBtn');
    if (endBtn) {
      endBtn.addEventListener('click', () => {
        if (!this.#ws) {
          alert('WebSocket connection is not available.');
          return;
        }
        const msg = {
          action: 'end',
          data: {
            winner_id: this.#user.id,
            player_left_score: this.#user.id === this.#game.player_left_id ? 5 : 0,
            player_right_score: this.#user.id === this.#game.player_right_id ? 5 : 0,
          },
        };
        console.log('ws msg', msg);
        this.#ws.send(JSON.stringify(msg));
      });
    }
  }

  async joinGame() {
    this.#ws = new WebSocket(`ws://127.0.0.1:8009/play/${this.#game.id}/${this.#user.id}`);
    this.#ws.onmessage = this.handleMessage;
    this.#ws.onerror = this.displayGameNotFound;
    this.#ws.onopen = () => console.log('ws play opened');
    this.#ws.onclose = () => {
      console.log('ws play closed');
      this.#ws = null;
    };
  }

  handleMessage(e) {
    try {
      const data = JSON.parse(e.data);
      console.log('ws', data);
      if (data.game) {
        this.#game = data.game;
        this.renderGame();
        if (this.#game.status === 'FINISHED' && this.#ws) {
          this.#ws.close();
          this.#ws = null;
        }
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while playing the game.');
      redirectTo('/');
    }
  }

  displayGameNotFound() {
    this.querySelector('#viewGameOnline-body').innerHTML = `
      <p class="mb-4">This game does not exist or you are not allowed to play it.</p>
      <p>
        <a class="btn btn-primary" data-link="/">Back to Dashboard</a>
      </p>
    `;
  }
}

customElements.define('view-game-online', ViewGameOnline);
