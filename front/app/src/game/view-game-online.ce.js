import { redirectTo } from '@/router.js';
import { getCsrfToken } from '@/auth.js';

class ViewGameOnline extends HTMLElement {
  async connectedCallback() {
    if (this.hasAttribute('game-id')) {
      const gameId = this.getAttribute('game-id');
      this.innerHTML = `
        <div class="text-center p-5">
          <h1 class="mb-4">Game online ${gameId}</h1>
          <button class="btn btn-primary" data-link="/">Go home</button>
        </div>
      `;

      try {
        const response = await fetch(`http://127.0.0.1:8009/games/${gameId}`);
        const game = await response.json();
        console.log(game);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.innerHTML = `
        <div class="vh-100 overflow-auto halo-bicolor d-flex flex-column p-2">
          <div class="d-flex">
            <a
              href="#"
              class="d-inline-block link-body-emphasis link-opacity-75 link-opacity-100-hover fs-4 m-3 btn-back"
              title="Back"
              data-link="/game"
            >
              <ui-icon name="arrow-left" class="me-2"></ui-icon>
            </a>
          </div>
          <div class="flex-shrink-0 my-auto text-center">
            <h3 class="mb-4">Searching for an opponent...</h3>
            <div class="fs-5 py-2">
              <div class="spinner-border border-3"></div>
            </div>
          </div>
          <div class="flex-shrink-0 py-4 mb-2"></div>
        </div>
      `;
      this.innerHTML = `
        <div class="container p-5">
          <form class="mb-4 p-5 border border-1" id="create-game-form">
            <div class="mb-3">
              <label for="player1_id" class="form-label">player1_id</label>
              <input type="text" class="form-control" id="player1_id" required>
            </div>
            <div class="mb-3">
              <label for="player2_id" class="form-label">player2_id</label>
              <input type="text" class="form-control" id="player2_id" required>
            </div>
            <button type="submit" class="btn btn-primary">Create game</button>
          </form>
          <hr />
          <div class="d-grid">
            <button class="btn btn-primary" id="get-all-games-btn">Get all games</button>
          </div>
        </div>
      `;

      this.querySelector('#create-game-form').addEventListener('submit', async e => {
        e.preventDefault();
        const player1_id = this.querySelector('#player1_id').value;
        const player2_id = this.querySelector('#player2_id').value;
        try {
          const response = await fetch(`http://127.0.0.1:8009/games`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': await getCsrfToken(),
            },
            credentials: 'include',
            body: JSON.stringify({ player1_id, player2_id }),
          });
          const games = await response.json();
          console.log(games);
        } catch (error) {
          console.error(error);
        }
      });

      this.querySelector('#get-all-games-btn').addEventListener('click', async e => {
        e.preventDefault();
        try {
          const response = await fetch(`http://127.0.0.1:8009/games`, {
            method: 'GET',
            credentials: 'include',
          });
          const games = await response.json();
          console.log(games);
        } catch (error) {
          console.error(error);
        }
      });
    }
  }
}

customElements.define('view-game-online', ViewGameOnline);
