import './game-matchup.ce.js';
import { getProfile } from '@/auth.js';
import { WS_BASE_URL } from '@/constants.js';

class GamePlayFake extends HTMLElement {
  #game = {};
  #user;
  #playerLeft = {};
  #playerRight = {};
  #ws;

  constructor() {
    super();
    this.displayGame = this.displayGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.displayGameNotFound = this.displayGameNotFound.bind(this);

    this.#user = getProfile();
    this.#user.id = String(this.#user.id);
  }

  async connectedCallback() {
    // Players
    this.#playerLeft = {
      name: this.getAttribute('player-left-name'),
      avatar: this.getAttribute('player-left-avatar'),
      type: this.getAttribute('player-left-type'),
    };
    this.#playerRight = {
      name: this.getAttribute('player-right-name'),
      avatar: this.getAttribute('player-right-avatar'),
      type: this.getAttribute('player-right-type'),
    };

    this.displayGame();
    setTimeout(this.joinGame, 2000);
  }

  disconnectedCallback() {
    if (this.#ws) {
      this.#ws.close();
      this.#ws = null;
    }
  }

  displayGame() {
    this.innerHTML = `
      <game-matchup
        id="GamePlayFake-matchup"
        player-left-id="${this.#playerLeft.id}"
        player-left-name="${this.#playerLeft.name}"
        player-left-avatar="${this.#playerLeft.avatar}"
        player-left-type="${this.#playerLeft.type}"
        player-left-wins="${this.#playerLeft.id === this.#game?.winner_id}"
        player-right-id="${this.#playerRight.id}"
        player-right-name="${this.#playerRight.name}"
        player-right-avatar="${this.#playerRight.avatar}"
        player-right-type="${this.#playerRight.type}"
        player-left-wins="${this.#playerRight.id === this.#game?.winner_id}"
        title="Waiting for your opponent..."
      ></game-matchup>      
      <div
        id="GamePlayFake-playground"
        hidden
        class="vh-100 halo-bicolor d-flex flex-columns align-items-center justify-content-center overflow-auto"
      >
        <div class="w-100 text-center p-5 flex-shrink-0">
          <h1 class="mb-4">Game is Running</h1>
          <button id="GamePlayFake-endBtn" class="btn btn-secondary fw-semibold">CLICK TO WIN</button>
          <button class="btn btn-primary" data-link="/game">Leave</button>
        </div>
      </div>
    `;

    if (this.#game.status === 'RUNNING') {
      this.querySelector('#GamePlayFake-matchup').hidden = true;
      this.querySelector('#GamePlayFake-playground').hidden = false;
    }

    const endBtn = this.querySelector('#GamePlayFake-endBtn');
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

  updateGame() {
    let winner = null;
    if (this.#playerLeft.id === this.#game.winner_id) {
      winner = this.#playerLeft;
    } else if (this.#playerRight.id === this.#game.winner_id) {
      winner = this.#playerRight;
    }

    // title
    const titleEl = this.querySelector('.gameMatchup-details-title');
    if (titleEl) {
      if (this.#game.status === 'WAITING') {
        titleEl.innerHTML = 'Waiting for your opponent...';
      } else {
        if (winner) {
          titleEl.innerHTML = winner.type === 'you' ? 'You win!' : 'You lose!';
        } else {
          titleEl.innerHTML = this.#game.status;
        }
      }
    }

    // show game running
    if (this.#game.status === 'RUNNING') {
      this.querySelector('#GamePlayFake-matchup').hidden = true;
      this.querySelector('#GamePlayFake-playground').hidden = false;
    } else {
      this.querySelector('#GamePlayFake-matchup').hidden = false;
      this.querySelector('#GamePlayFake-playground').hidden = true;
    }
  }

  async joinGame() {
    this.#ws = new WebSocket(`${WS_BASE_URL}:8009/play/${this.getAttribute('game-id')}`);
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
        this.updateGame();
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

  formatDateTime(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}

customElements.define('game-play-fake', GamePlayFake);
