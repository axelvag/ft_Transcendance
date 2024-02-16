class LoginLayout extends HTMLElement {
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

      .auth-layout {
        height: 100vh;
        display: grid;
        justify-items: center;
        overflow: auto;
        background-color: var(--bs-tertiary-bg);
      }

      .auth-layout-wrapper {
        padding: 2rem;
        width: 100%;
        max-width: 520px;
      }

      /* tablet */
      @media (min-width: 768px) {
        .auth-layout {
          background-color: var(--bs-secondary-bg);
          align-items: center;
          padding: 2rem;
        }

        .auth-layout-wrapper {
          background-color: var(--bs-tertiary-bg);
          border: 2px solid var(--bs-gray-500);
          border-radius: 1.5rem;
        }
      }
    </style>
    <div class="auth-layout">
      <div class="auth-layout-wrapper">
        <slot></slot>
      </div>
    </div>
    `;
  }
}

customElements.define('login-layout', LoginLayout);
