class UiLoader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
  }
}

customElements.define('ui-loader', UiLoader);
