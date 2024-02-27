import '@/components/layouts/default-layout/default-layout-main.ce.js';

class ViewNotFound extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-main>
        <h1>Not found</h1>
      </default-layout-main>
    `;
  }
}
customElements.define('view-not-found', ViewNotFound);
