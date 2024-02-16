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
        background: var(--bs-tertiary-bg);
      }

      .auth-layout-wrapper {
        padding: 2rem;
        width: 100%;
        max-width: 520px;
      }

      /* tablet */
      @media (min-width: 768px) {
        .auth-layout {
          background: none;
          align-items: center;
          padding: 2rem;
          
          --halo-bicolor-bg-rgb: var(--bs-body-bg-rgb);

          background-color: rgba(var(--halo-bicolor-bg-rgb), 1);
          background-image: radial-gradient(
              closest-side,
              rgba(var(--halo-bicolor-bg-rgb), 0) 0%,
              rgba(var(--halo-bicolor-bg-rgb), 1) 100%
            ),
            linear-gradient(to right, rgba(var(--bs-primary-rgb), 0.25) 0%, rgba(var(--bs-secondary-rgb), 0.25) 100%);
          background-size: 1000px 1000px, 1000px 1000px;
          background-repeat: no-repeat;
          background-position: center center;
          background-attachment: fixed;
        }

        .auth-layout-wrapper {
          background: var(--bs-tertiary-bg);
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
