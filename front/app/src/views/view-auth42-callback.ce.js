import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { handleOAuthResponse } from '@/auth.js';

class ViewLoading extends HTMLElement {
  connectedCallback() {
    window.addEventListener('storage', event => {
      if (event.key === 'isLogged' && event.newValue === 'false') {
        // Logique pour gérer la déconnexion, par exemple :
        console.log('logout logout');
        window.location.href = '/login'; // Rediriger vers la page de connexion
        return;
      }
    });
    this.innerHTML = `
      <div class="vh-100 overflow-auto halo-bicolor d-flex flex-column p-2">
        <div class="flex-shrink-0 my-auto text-center">
          <h3 class="mb-4">
            Signing in with
            <ui-icon name="42" class="mx-2"></ui-icon>
            ...
          </h3>
          <div class="fs-5 py-2">
            <div class="spinner-border border-3"></div>
          </div>
        </div>
        <div class="flex-shrink-0 py-4 mb-2"></div>
      </div>
    `;
    handleOAuthResponse();
  }
}

customElements.define('view-auth42-callback', ViewLoading);
