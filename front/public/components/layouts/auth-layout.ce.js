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
        position: relative;
        display: flex;
      }

      .auth-layout-img {
        display: block;
        min-width: 0;
        flex: 1 1 0;
        background: url(./assets/img/login-bg.jpg) no-repeat center center;
        background-size: cover;
      }

      .auth-layout-body {
        min-width: 0;
        flex: 1 1 0;
        height: 100vh;
        overflow: auto;
        display: grid;
        justify-items: center;
      }

      .auth-layout-wrapper {
        padding: 2rem;
        width: 100%;
        max-width: 520px;
      }

      /* tablet */
      @media (min-width: 768px) {
        .auth-layout-body {
          align-items: center;
          padding: 2rem;
        }

        .auth-layout-wrapper {
          border: 2px solid var(--bs-gray-500);
          border-radius: 1.5rem;
        }
      }

      /* desktop */
      @media (max-width: 1279px) {
        .auth-layout-img {
          display: none;
        }
      }
    </style>
    <div class="auth-layout">
      <div class="auth-layout-body">
        <div class="auth-layout-wrapper">
          <slot></slot>
        </div>
      </div>
      <div class="auth-layout-img"></div>
    </div>
    `;
  }
}

customElements.define('login-layout', LoginLayout);
