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

          position: relative;
          z-index: 0;
          &::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 500px;
            width: 500px;
            border-radius: 50%;
            background-image: linear-gradient(to right, var(--bs-primary) 0%, var(--bs-secondary) 100%);
            filter: blur(1000px);
            opacity: 0.75;
          }
        }

        .auth-layout-wrapper {
          background: var(--bs-tertiary-bg);
          border: 2px solid var(--bs-gray-500);
          border-radius: 1.5rem;
          
          position: relative;
          z-index: 1;
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
