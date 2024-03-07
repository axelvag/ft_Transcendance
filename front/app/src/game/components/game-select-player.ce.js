import { isAuthenticated, getProfile } from '@/auth.js';
import { characters } from '../utils/characters';

class GameSelectPlayer extends HTMLElement {
  #title = 'Select Player';
  #options = [];
  #selected = null;
  #direction = '';
  #theme = '';
  #playerType = '';

  async connectedCallback() {
    this.#title = this.getAttribute('title');
    this.#direction = this.getAttribute('direction') || 'left';
    this.#theme = this.#direction === 'right' ? 'secondary' : 'primary';
    this.#playerType = this.getAttribute('type') || '';

    // options
    this.#options = characters.map(character => ({ ...character, type: this.#playerType }));
      const isLoggedIn = await isAuthenticated();
      if (isLoggedIn) {
        const profile = getProfile();
        this.#options.unshift({
          id: profile.id,
          name: profile.username,
          avatar: profile.avatar,
          type: this.#playerType,
        });
    }

    // selected
    this.#selected = this.#options.find(option => option.id == this.getAttribute('selected-id'));

    const optionsHtml = this.#options
      .map(option => {
        const checkedAttr = option.id === this.#selected?.id ? 'checked' : '';
        return `
          <div class="flex-shrink-0 flex-grow-0">
            <input
              type="radio"
              class="btn-check"
              name="gamePlayerSelect-options"
              id="gamePlayerSelect-option-${option.id}"
              value="${option.id}"
              autocomplete="off"
              ${checkedAttr}
            />
            <label
              class="btn p-0 border-3 overflow-hidden"
              style="--bs-btn-active-border-color: var(--bs-${this.#theme});";
              for="gamePlayerSelect-option-${option.id}"
            >
              <img
                id="${option.id}"
                alt="${option.name}"
                src="${option.avatar}"
                class="img-fluid"
                width="64"
                height="64"
              />
            </label>
          </div>
        `;
      })
      .join('');

    this.innerHTML = `
      <div class="vh-100 overflow-auto halo-bicolor d-flex flex-column p-2">
        <div class="d-flex">
          <a href="#" class="d-inline-block link-body-emphasis link-opacity-75 link-opacity-100-hover fs-4 m-3 gameSelectPlayer-back" title="back">
            <ui-icon name="arrow-up" rotate="-90" class="me-2"></ui-icon>
          </a>
        </div>
        <div class="flex-shrink-0 container-fluid my-auto" style="max-width: 60rem;">
          <h1 class="fw-bold text-center mb-5">${this.#title}</h1>

          <!-- Selected -->
          <div class="d-flex justify-content-center mb-4">
            <game-player
              class="small fs-lg-5 gameSelectPlayer-selected"
              name="${this.#selected?.name}"
              avatar="${this.#selected?.avatar}"
              type="${this.#playerType}"
              direction="${this.#direction}"
            ></game-player>
          </div>
          
          <!-- Options -->
          <div class="d-flex flex-wrap justify-content-center gap-2 py-4 mb-4">
            ${optionsHtml}
          </div>
          
          <div class="text-center">
            <button class="btn btn-${this.#theme} fw-semibold gameSelectPlayer-validate">Select</button>
          </div>

        </div>
        <div class="flex-shrink-0 py-4 mb-2"></div>
      </div>
    `;

    this.querySelector('.gameSelectPlayer-back').addEventListener('click', e => {
      e.preventDefault();
      if (this.onCancel) this.onCancel();
    });

    this.querySelectorAll('input[name="gamePlayerSelect-options"]').forEach(inputEl => {
      inputEl.addEventListener('change', e => {
        const selectedId = e.target.value;
        this.#selected = this.#options.find(option => option.id == selectedId);
        this.displaySelected();
      });
    });

    this.querySelector('.gameSelectPlayer-validate').addEventListener('click', e => {
      e.preventDefault();
      if (this.onSelect) this.onSelect({ ...this.#selected });
    });
  }

  displaySelected() {
    this.querySelector('.gameSelectPlayer-selected').setAttribute('name', this.#selected?.name);
    this.querySelector('.gameSelectPlayer-selected').setAttribute('avatar', this.#selected?.avatar);
  }
}
customElements.define('game-select-player', GameSelectPlayer);
