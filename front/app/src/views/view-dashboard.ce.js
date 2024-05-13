import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { getProfile } from '@/auth.js';
import { notifyError } from '@/notifications.js';
import { BASE_URL } from '@/constants.js';

class ViewDashboard extends HTMLElement {
  connectedCallback() {
    const profile = getProfile();

    const fullname = [profile.firstname, profile.lastname].join(' ').trim();

    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>

        <div class="bg-body-secondary rounded mb-4 p-4">
          <div class="row align-items-center flex-column-reverse flex-md-row">
            <div class="col-md-8 px-4 text-center text-md-start">
              <h3 class="display-3 text-truncate fw-bold text-truncate mb-4">
                ${profile.username}
              </h3>
              <p class="fs-6 text-truncate fw-semibold text-truncate opacity-50 mb-2">
                ${profile.email}
              </p>
              <p class="fs-6 text-truncate fw-semibold text-truncate opacity-50 mb-2">
                ${fullname}
              </p>
              <p class="mt-4 pt-2">
                <a class="btn btn-primary btn-sm py-2 px-3 fw-bold" href="#" data-link="/game">
                  Start a game
                  <ui-icon name="arrow-right" class="ms-2 d-none d-md-inline-block"></ui-icon>
                </a>
              </p>
            </div>
            <div class="col-md-4 text-center">
              <img src="${profile.avatar}" class="img-thumbnail rounded-circle object-fit-cover my-3" alt="character" style="width: 196px; height: 196px;">
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <div class="bg-body-secondary rounded py-4 px-3 mb-4 text-center">
              <div class="display-1 fw-bold ff-score">
                <span id="viewDashboard-gameCounter" class="text-bicolor">&nbsp;</span>
              </div>
              <div class="flex-grow-1 flex-shrink-1 text-truncate fs-5 fw-semibold opacity-50">
                Games played
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="bg-body-secondary rounded py-4 px-3 mb-4 text-center">
              <div class="display-1 fw-bold ff-score">
                <span id="viewDashboard-victoryCounter" class="text-bicolor">&nbsp;</span>
              </div>
              <div class="flex-grow-1 flex-shrink-1 text-truncate fs-5 fw-semibold opacity-50">
              Victories
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="bg-body-secondary rounded py-4 px-3 mb-4 text-center">
              <div class="display-1 fw-bold ff-score">
                <span id="viewDashboard-defeatCounter" class="text-bicolor">&nbsp;</span>
              </div>
              <div class="flex-grow-1 flex-shrink-1 text-truncate fs-5 fw-semibold opacity-50">
              Defeats
              </div>
            </div>
          </div>
        </div>

      </default-layout-main>
    `;

    this.fetchStatistics();
  }

  async fetchStatistics() {
    const gameCounterEl = this.querySelector('#viewDashboard-gameCounter');
    const victoryCounterEl = this.querySelector('#viewDashboard-victoryCounter');
    const defeatCounterEl = this.querySelector('#viewDashboard-defeatCounter');
    console.log(gameCounterEl);
    try {
      const statistics = await fetch(`${BASE_URL}:8009/game-statistics`, {
        credentials: 'include',
      }).then(res => res.json());

      if (gameCounterEl) gameCounterEl.textContent = statistics.games || 0;
      if (victoryCounterEl) victoryCounterEl.textContent = statistics.victories || 0;
      if (defeatCounterEl) defeatCounterEl.textContent = statistics.defeats || 0;
    } catch (error) {
      console.error(error);
      notifyError('Fetching user statistics failed!');
      if (gameCounterEl) gameCounterEl.textContent = '-';
      if (victoryCounterEl) victoryCounterEl.textContent = '-';
      if (defeatCounterEl) defeatCounterEl.textContent = '-';
    }
  }
}

customElements.define('view-dashboard', ViewDashboard);
