import { redirectTo } from '@/router.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewRank extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center" style="margin-top: -50px;">
          Rank
        </h1>

      </default-layout-main>
    `;
  }

  
}
customElements.define('view-rank', ViewRank);
