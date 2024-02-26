import style from './auth-layout.ce.scss?inline';

class AuthLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
    <style>${style}</style>
    <div class="authLayout">
      <div class="authLayout-wrapper">
        <slot></slot>
      </div>
    </div>
    `;
  }
}

customElements.define('auth-layout', AuthLayout);
