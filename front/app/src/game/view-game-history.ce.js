import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { getProfile, getCsrfToken } from '@/auth.js';
import { redirectTo } from '@/router.js';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ViewGameHistory extends HTMLElement {
  #user;
  #games = [];
  #bodyEl;

  constructor() {
    super();

    this.#user = getProfile();
  }

  async connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="mb-4">Game History</h1>
        <div id="viewGameHistory-body">
          <p>Loading...</p>
        </div>
      </default-layout-main>
    `;

    this.#bodyEl = this.querySelector('#viewGameHistory-body');
    this.fetchGames();

    document.addEventListener('click', this.handleClickRow);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleClickRow);
  }

  handleClickRow(event) {
    const rowEl = event.target.closest('tr[data-game-id]');
    if (!rowEl) return;
    const gameId = rowEl.getAttribute('data-game-id');
    redirectTo(`/game/online/${gameId}`);
  }

  formatDateTime(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  async fetchGames() {
    try {
      this.#games = await fetch(`${BASE_URL}:8009/games/history/${this.#user.id}`).then(res => res.json());

      // Fetch opponent profiles
      const opponents = {};
      let opponentIds = this.#games.map(game => game.opponent_id);
      opponentIds = [...new Set(opponentIds)];
      const csrfToken = await getCsrfToken();
      await Promise.all(
        opponentIds.map(async opponentId => {
          const opponent = await fetch(API_BASE_URL + `/accounts/get_user_profile/${opponentId}`, {
            method: 'GET',
            headers: { 'X-CSRFToken': csrfToken },
            credentials: 'include',
          })
            .then(res => res.json())
            .then(res => res.getProfile);
          opponents[opponentId] = opponent;
        })
      );
      this.#games = this.#games.map(game => ({
        ...game,
        opponent: opponents[game.opponent_id],
      }));
    } catch (error) {
      console.error(error);
    }

    if (!this.#bodyEl) return;

    if (this.#games.length === 0) {
      this.#bodyEl.innerHTML = '<p>No game found</p>';
    } else {
      const getRowHtml = game => `
        <tr data-game-id="${game.id}">
          <td class="bg-transparent align-middle py-3">
            <img
              src="${game.opponent?.avatar || '/assets/img/default-profile.jpg'}"
              alt="avatar"
              class="fs-3 rounded-circle me-2"
              style="width: 1em; height: 1em;"
            />
            <small>${game.opponent?.username}</small>
          </td>
          <td class="bg-transparent align-middle">${
            game.is_victory
              ? '<span class="badge text-bg-success">VICTORY</span>'
              : '<span class="badge text-bg-danger">DEFEAT</span>'
          }</td>
          <td class="bg-transparent align-middle">
            ${game.player_forfeit ? 'Forfeit' : game.player_score}
            -
            ${game.opponent_forfeit ? 'Forfeit' : game.opponent_score}
          </td>
          <td class="bg-transparent align-middle">
            <small>${this.formatDateTime(game.ended_at)}</small>
          </td>
        </tr>
      `;
      this.#bodyEl.innerHTML = `
        <p>${this.#games.length} game(s) found</p>
        <div class="table-responsive mt-5">
          <table class="table table-hover text-center text-nowrap">
            <thead>
              <tr>
                <th scope="col" class="bg-transparent" width="25%">Opponent</th>
                <th scope="col" class="bg-transparent" width="25%">Result</th>
                <th scope="col" class="bg-transparent" width="25%">Score (You - Opp.)</th>
                <th scope="col" class="bg-transparent" width="25%">End date</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              ${this.#games.map(getRowHtml).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }
}

customElements.define('view-game-history', ViewGameHistory);
