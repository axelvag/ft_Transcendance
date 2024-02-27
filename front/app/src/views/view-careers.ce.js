import { isAuthenticated } from '@/auth.js';
import { redirectTo } from '@/router.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';

class ViewCareers extends HTMLElement {
  connectedCallback() {
    const isAuth = isAuthenticated();
    if (!isAuth) {
      redirectTo('/login');
    } else {
      this.render();
    }
  }

  render() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1>Careers</h1>
      </default-layout-main>
    `;
  }
}
customElements.define('view-careers', ViewCareers);
