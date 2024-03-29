import style from './auth-layout.ce.scss?inline';

class AuthLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    const loadingClass = this.hasAttribute('loading') ? 'is-loading' : '';

    this.shadowRoot.innerHTML = `
    <style>${style}</style>
    <div class="authLayout ${loadingClass}">
      <div class="authLayout-wrapper">
        <div class="authLayout-wrapper-inner">
          <slot></slot>
        </div>
      </div>
    </div>
    `;
  }

  static get observedAttributes() {
    return ['loading'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'loading') {
      this.shadowRoot.querySelector('.authLayout').classList.toggle('is-loading', Boolean(newValue));
    }
  }
}

customElements.define('auth-layout', AuthLayout);
