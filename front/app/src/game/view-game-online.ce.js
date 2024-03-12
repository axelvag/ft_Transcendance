import { redirectTo } from '@/router.js';

class ViewGameOnline extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('game-id')) {
      const gameId = this.getAttribute('game-id');
      this.innerHTML = `
        <div class="text-center p-5">
          <h1 class="mb-4">Game online ${gameId}</h1>
          <button class="btn btn-primary" data-link="/">Go home</button>
        </div>
      `;
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

      setTimeout(() => {
        redirectTo('/game/online/123');
      }, 3000);
    }
  }
}

customElements.define('view-game-online', ViewGameOnline);
