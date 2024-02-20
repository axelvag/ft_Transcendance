import style from './default-layout-main.ce.scss?inline';

class DefaultLayoutMain extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
    <style>${style}</style>
    <div class="defaultLayoutMain">
      <div class="defaultLayoutMain-wrapper">
        <slot></slot>
      </div>
    </div>
    `;
  }
}

customElements.define('default-layout-main', DefaultLayoutMain);
