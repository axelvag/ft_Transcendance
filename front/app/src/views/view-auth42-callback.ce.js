import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { handleOAuthResponse } from '@/auth.js';
import { notify } from '@/notifications.js';

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
    <default-layout-main>
      <div class="d-flex flex-column justify-content-center align-items-center">
        <h1 class="text-bicolor display-3 fw-bolder">
          TRANSCENDANCE PONG
        </h1>
        <div class="d-flex flex-column justify-content-center align-items-center vh-100">
          <h2 class="display-6 fw-bolder">
            Authentication in progress...
          </h2>
          <div class="spinner-border mb-5" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

    </default-layout-main>
    `;
    handleOAuthResponse();
  }
}

customElements.define('view-auth42-callback', ViewLoading);
