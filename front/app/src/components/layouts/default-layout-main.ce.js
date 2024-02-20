class DefaultLayoutMain extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--bs-tertiary-bg);
        padding: 3rem 0 0;
      }
      @media (min-width: 992px) {
        :host {
          padding: 0 0 0 15rem;
        }
      }

      .defaultLayoutMain {
        width: 100%;
      }

      .defaultLayoutMain-wrapper {
        margin: 0 auto;
        padding: 2rem 1.5rem;
        max-width: 60rem;
      }

      /* tablet */
      @media (min-width: 768px) {
        .defaultLayoutMain-wrapper {
          padding: 4rem 3rem;
        }
      }
    </style>
    <div class="defaultLayoutMain">
      <div class="defaultLayoutMain-wrapper">
        <slot></slot>
      </div>
    </div>
    `;
  }
}

customElements.define('default-layout-main', DefaultLayoutMain);
