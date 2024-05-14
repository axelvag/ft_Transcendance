import './game-renderer-3d.ce.js';
import './game-player.ce.js';
import './game-scoreboard.ce.js';
import './game-dialog.ce.js';
import './game-play.ce.scss';
import GameWorker from '../utils/GameWorker.js?worker';
import GameWorkerRemote from '../utils/GameWorkerRemote.js?worker';
import AudioPlayer from '../utils/AudioPlayer.js';
import { exitFullscreen } from '@/fullscreen.js';
import { redirectTo } from '@/router.js';
import calculateNextAiPosition from '../utils/calculateNextAiPosition.js';

const template = `
<div class="gamePlay" hidden>
  <div class="gamePlay-wrapper">
    <div class="gamePlay-header">
      <game-scoreboard></game-scoreboard>
    </div>
    <div class="gamePlay-body">
      <div class="gamePlay-body-left">
        <div class="gamePlay-touchBtn is-playerLeft is-up">
          <ui-icon name="arrow-up"></ui-icon>
        </div>
        <game-player class="gamePlay-player-left"></game-player>
        <div class="gamePlay-touchBtn is-playerLeft is-down">
        <ui-icon name="arrow-down"></ui-icon>
      </div>
      </div>
      <div class="gamePlay-body-center">
        <game-renderer-3d class="gamePlay-renderer"></game-renderer-3d>
      </div>
      <div class="gamePlay-body-right">
        <div class="gamePlay-touchBtn is-playerRight is-up">
        <ui-icon name="arrow-up"></ui-icon>
      </div>
        <game-player class="gamePlay-player-right"></game-player>
        <div class="gamePlay-touchBtn is-playerRight is-down">
        <ui-icon name="arrow-down"></ui-icon>
      </div>
      </div>
    </div>
    <div class="gamePlay-footer">
      <a href="#" class="gamePlay-footer-btn pause">
        <ui-icon name="pause"></ui-icon>
      </a>
    </div>
  </div>
  <game-dialog class="gamePlay-dialog"></game-dialog>
</div>


<!-- Error Modal -->
<div id="gamePlayErrorModal" hidden>
  <div class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger d-block text-center">
          <ui-icon name="error" class="fs-1"></ui-icon>
        </div>
        <div class="modal-body d-flex flex-column align-items-center gap-2 py-4">
          <p>An unexpected error occured!</p>
          <button type="button" class="btn btn-danger" data-link="/">Leave</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show"></div>
</div>
`;

class GamePlay extends HTMLElement {
  #isOnline = false;
  #keys = {};
  #touchs = {
    left: { up: false, down: false },
    right: { up: false, down: false },
  };
  #gameState = null;
  #audioPlayer = null;
  #playerLeft = {};
  #playerRight = {};
  #playerLeftKeys = ['w', 's'];
  #playerRightKeys = ['ArrowUp', 'ArrowDown'];
  #aiInterval = null;

  constructor() {
    super();

    this.renderDialog = this.renderDialog.bind(this);
    this.handleInitMessage = this.handleInitMessage.bind(this);
    this.handleUpdateMessage = this.handleUpdateMessage.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.#isOnline = this.hasAttribute('game-id');
    if (this.#isOnline) {
      this.gameWorker = new GameWorkerRemote();
      this.gameWorker.postMessage({
        type: 'join',
        data: {
          gameId: this.getAttribute('game-id'),
          userId: this.getAttribute('user-id'),
        },
      });
    } else {
      this.gameWorker = new GameWorker();
    }

    this.#audioPlayer = new AudioPlayer();
    this.#audioPlayer.load('collision', '/assets/sounds/hit.wav');
    this.#audioPlayer.load('score', '/assets/sounds/score.wav');
    this.#audioPlayer.load('victory', '/assets/sounds/victory.wav');
    this.#audioPlayer.load('defeat', '/assets/sounds/defeat.wav');
  }

  connectedCallback() {
    this.innerHTML = template;

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

    // Disable opponent controls (ai and remote player)
    if (this.#playerLeft.type === 'ai' || (this.#isOnline && this.#playerLeft.type !== 'you')) {
      this.#playerLeftKeys = [];
      this.querySelectorAll('.gamePlay-touchBtn.is-playerLeft').forEach(el => {
        el.hidden = true;
      });
    }
    if (this.#playerRight.type === 'ai' || (this.#isOnline && this.#playerRight.type !== 'you')) {
      this.#playerRightKeys = [];
      this.querySelectorAll('.gamePlay-touchBtn.is-playerRight').forEach(el => {
        el.hidden = true;
      });
    }

    // Dialog
    this.dialogEl = this.querySelector('.gamePlay-dialog');

    // Renderer
    this.rendererEl = this.querySelector('.gamePlay-renderer');

    // Game events
    this.gameWorker.onmessage = function (e) {
      const data = e.data || {};
      if (data.type === 'init') {
        this.handleInitMessage(data);
      } else if (data.type === 'update') {
        this.handleUpdateMessage(data);
      }
    };
    this.gameWorker.onmessage = this.gameWorker.onmessage.bind(this);

    // Game error
    this.gameWorker.onerror = function (e) {
      console.error(e.message);
      this.gameWorker.terminate();
      this.querySelector('#gamePlayErrorModal').hidden = false;
    };
    this.gameWorker.onerror = this.gameWorker.onerror.bind(this);

    // UI Events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchend', this.handleTouchEnd);

    // pause button
    this.querySelector('.pause').addEventListener('click', e => {
      e.preventDefault();
      this.gameWorker.postMessage({ type: 'pause' });
    });

    // display `Waiting` dialog
    if (this.#isOnline) {
      this.#gameState = {
        status: 'waiting',
        playerLeft: { ...this.#playerLeft },
        playerRight: { ...this.#playerRight },
      };
      this.renderPlayers();
      this.renderDialog();
      this.querySelector('.gamePlay').hidden = false;
    }
  }

  disconnectedCallback() {
    // stop renderer
    this.rendererEl.stop();

    // remove events
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);

    // close worker
    this.gameWorker.postMessage({ type: 'reset' });
    this.gameWorker.terminate();

    // clear interval
    clearInterval(this.#aiInterval);

    // exit fullscreen
    exitFullscreen();
  }

  renderPlayers() {
    this.playerLeftEl = this.querySelector('.gamePlay-player-left');
    if (this.playerLeftEl) {
      this.playerLeftEl.setAttribute('name', this.#gameState.playerLeft.name);
      this.playerLeftEl.setAttribute('avatar', this.#gameState.playerLeft.avatar);
      this.playerLeftEl.setAttribute('type', this.#gameState.playerLeft.type);
      this.playerLeftEl.setAttribute('score', 0);
      this.playerLeftEl.setAttribute('score-max', this.#gameState.scoreMax);
    }

    this.playerRightEl = this.querySelector('.gamePlay-player-right');
    if (this.playerLeftEl) {
      this.playerRightEl.setAttribute('name', this.#gameState.playerRight.name);
      this.playerRightEl.setAttribute('avatar', this.#gameState.playerRight.avatar);
      this.playerRightEl.setAttribute('type', this.#gameState.playerRight.type);
      this.playerRightEl.setAttribute('score', 0);
      this.playerRightEl.setAttribute('score-max', this.#gameState.scoreMax);
      this.playerRightEl.setAttribute('direction', 'right');
    }
  }

  renderScores() {
    this.querySelector('.gamePlay-player-left')?.setAttribute('score', this.#gameState.scoreLeft || 0);
    this.querySelector('game-scoreboard')?.setAttribute('score-left', this.#gameState.scoreLeft || 0);
    this.querySelector('.gamePlay-player-right')?.setAttribute('score', this.#gameState.scoreRight || 0);
    this.querySelector('game-scoreboard')?.setAttribute('score-right', this.#gameState.scoreRight || 0);
  }

  renderDialog() {
    const players = {
      playerLeft: this.#gameState.playerLeft,
      playerRight: this.#gameState.playerRight,
    };

    const controls = {
      pause: {
        icon: 'pause',
        action: () => this.gameWorker.postMessage({ type: 'pause' }),
      },
      resume: {
        icon: 'play',
        action: () => this.gameWorker.postMessage({ type: 'resume' }),
      },
      quit: {
        icon: 'quit',
        action: () => redirectTo('/dashboard'),
      },
      restart: {
        icon: 'restart',
        action: () => {
          this.gameWorker.postMessage({ type: 'reset' });
          this.gameWorker.postMessage({ type: 'start' });
        },
      },
    };

    switch (this.#gameState.status) {
      case 'waiting':
        this.dialogEl.render({
          open: true,
          players,
          title: 'Waiting for opponent...',
          back: {
            action: () => redirectTo('/game'),
          },
        });
        break;
      case 'paused':
        this.dialogEl.render({
          open: true,
          title: 'Paused',
          controls: [controls.restart, { ...controls.resume, large: true }, controls.quit],
        });
        break;
      case 'finished':
        const winner = this.#gameState.scoreLeft > this.#gameState.scoreRight ? 'left' : 'right';
        const winnerName = winner === 'left' ? players.playerLeft.name : players.playerRight.name;
        this.dialogEl.render({
          open: true,
          players,
          winner,
          title: `${winnerName} wins!`,
          controls: [{ ...controls.restart, large: true }],
          back: {
            action: () => redirectTo('/game'),
          },
        });
        break;
      default:
        this.dialogEl.render({ open: false });
    }
  }

  handleInitMessage(data) {
    // todo: validate data
    const dataState = data?.state;
    this.#gameState = {
      playerLeft: { ...this.#playerLeft },
      playerRight: { ...this.#playerRight },
      ...dataState,
    };
    this.style.setProperty('--gamePlay-ratio', `${this.#gameState.width / this.#gameState.height}`);
    this.renderPlayers();
    this.renderDialog();
    this.renderScores();
    this.rendererEl.init(this.#gameState);
    this.rendererEl.start();
    this.querySelector('.gamePlay').hidden = false;

    this.gameWorker.postMessage({ type: 'start' });

    // AI interval
    if (this.#playerLeft.type === 'ai' || this.#playerRight.type === 'ai') {
      const aiOptions = {
        waitForRebound: true,
        goToCenterOnWait: false,
        dirRandomness: 0.4,
      };
      this.#aiInterval = setInterval(() => {
        if (this.#playerLeft.type === 'ai') {
          const result = calculateNextAiPosition(this.#gameState, 'left', aiOptions);
          this.gameWorker.postMessage({ type: 'updatePaddleLeftMove', data: { targetY: result.targetY } });
        }
        if (this.#playerRight.type === 'ai') {
          const result = calculateNextAiPosition(this.#gameState, 'right', aiOptions);
          this.gameWorker.postMessage({ type: 'updatePaddleRightMove', data: { targetY: result.targetY } });
        }
      }, 1000);
    }
  }

  handleUpdateMessage(data) {
    // todo: validate data
    const updates = data?.state;
    this.#gameState = {
      ...this.#gameState,
      ...updates,
    };

    // dialog
    this.renderDialog();

    // renderer
    this.rendererEl.update(updates);
    if (updates.status === 'finished') {
      this.rendererEl.stop();
    }

    // players and board
    if (updates.scoreLeft != null || updates.scoreRight != null) {
      this.renderScores();
    }

    // sounds
    this.#audioPlayer.play(data?.event);
  }

  handleKeyDown(event) {
    // space
    if (event.code === 'Space') {
      switch (this.#gameState.status) {
        case 'initialized':
          this.gameWorker.postMessage({ type: 'start' });
          return;
        case 'running':
          this.gameWorker.postMessage({ type: 'pause' });
          return;
        case 'paused':
          this.gameWorker.postMessage({ type: 'resume' });
          return;
        case 'finished':
          this.gameWorker.postMessage({ type: 'reset' });
          this.gameWorker.postMessage({ type: 'start' });
          this.renderDialog();
          return;
      }
    }

    // paddle moves
    if (![...this.#playerLeftKeys, ...this.#playerRightKeys].includes(event.key)) return;
    if (this.#keys[event.key]) return;

    this.#keys[event.key] = true;

    if (this.#playerLeftKeys.includes(event.key)) {
      const dir = Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s));
      this.gameWorker.postMessage({ type: 'updatePaddleLeftMove', data: { dir } });
    } else {
      const dir = Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown));
      this.gameWorker.postMessage({ type: 'updatePaddleRightMove', data: { dir } });
    }
  }

  handleKeyUp(event) {
    // paddle moves (stop)
    if (!this.#keys[event.key]) return;

    this.#keys[event.key] = false;

    if (this.#playerLeftKeys.includes(event.key)) {
      this.#updatePaddleLeftMove();
    } else if (this.#playerRightKeys.includes(event.key)) {
      this.#updatePaddleRightMove();
    }
  }

  handleTouchStart(event) {
    const touchEl = event.target.closest('.gamePlay-touchBtn');
    if (!touchEl || touchEl.hidden) return;

    event.preventDefault();

    const playerKey = touchEl.classList.contains('is-playerLeft') ? 'left' : 'right';
    const dirKey = touchEl.classList.contains('is-up') ? 'up' : 'down';
    this.#touchs[playerKey][dirKey] = true;

    touchEl.classList.add('is-active');
    if (playerKey === 'left') {
      this.#updatePaddleLeftMove();
    } else {
      this.#updatePaddleRightMove();
    }
  }

  handleTouchEnd(event) {
    const touchEl = event.target.closest('.gamePlay-touchBtn');
    if (!touchEl) return;

    event.preventDefault();

    const playerKey = touchEl.classList.contains('is-playerLeft') ? 'left' : 'right';
    const dirKey = touchEl.classList.contains('is-up') ? 'up' : 'down';
    this.#touchs[playerKey][dirKey] = false;

    touchEl.classList.remove('is-active');
    if (playerKey === 'left') {
      this.#updatePaddleLeftMove();
    } else {
      this.#updatePaddleRightMove();
    }
  }

  #updatePaddleLeftMove() {
    const keyMove = Number(Boolean(this.#keys.w)) - Number(Boolean(this.#keys.s));
    const touchMove = Number(Boolean(this.#touchs.left.up)) - Number(Boolean(this.#touchs.left.down));

    let dir = 0;
    if (keyMove + touchMove > 0) {
      dir = 1;
    } else if (keyMove + touchMove < 0) {
      dir = -1;
    }
    this.gameWorker.postMessage({ type: 'updatePaddleLeftMove', data: { dir } });
  }

  #updatePaddleRightMove() {
    const keyMove = Number(Boolean(this.#keys.ArrowUp)) - Number(Boolean(this.#keys.ArrowDown));
    const touchMove = Number(Boolean(this.#touchs.right.up)) - Number(Boolean(this.#touchs.right.down));

    let dir = 0;
    if (keyMove + touchMove > 0) {
      dir = 1;
    } else if (keyMove + touchMove < 0) {
      dir = -1;
    }
    this.gameWorker.postMessage({ type: 'updatePaddleRightMove', data: { dir } });
  }
}

customElements.define('game-play', GamePlay);
