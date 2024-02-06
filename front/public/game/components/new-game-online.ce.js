import { redirectTo } from '../../router.js';

const template = `
    <div class="d-grid pt-3">
      <button class="btn btn-primary" disabled>
        <span class="spinner-border spinner-border-sm me-2"></span>
        Searching for an opponent...
      </button>
    </div>
`;

class NewGameOnline extends HTMLElement {
  constructor() {
    super();

    this.ws = new WebSocket(`ws://localhost:8003/search-opponent`);

    this.ws.onopen = e => {
      console.log('search-opponent socket opened');
    };

    this.ws.onmessage = e => {
      const data = JSON.parse(e.data);
      console.log('search-opponent socket message', data);
      if (data?.game_id) {
        // requestAnimationFrame prevents violation reflow
        requestAnimationFrame(() => {
          redirectTo('/game/play', { query: { game_id: data.game_id } });
        });
      }
    };

    this.ws.onclose = e => {
      console.log('search-opponent socket closed');
    };

    this.ws.onerror = e => {
      console.error('search-opponent socket error');
    };
  }

  connectedCallback() {
    this.innerHTML = template;
  }

  disconnectedCallback() {
    this.ws.close();
  }
}

customElements.define('new-game-online', NewGameOnline);
