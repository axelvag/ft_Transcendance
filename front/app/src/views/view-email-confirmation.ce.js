import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { BASE_URL } from '@/constants.js';
import { notify } from '@/notifications.js';
import { getCsrfToken } from '@/auth.js';

class ViewEmailConfirmation extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
        <auth-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-bicolor">Email confirmation</span>
        </h1>
        <div id="email-confirm-loading">Loading...</div>

        <!-- Success -->
        <div id="email-confirm-success" hidden>
          <h5 class="fw-bold">Success</h5>
          <p id="email-confirm-error-msg">You can login now</p>
          <button class="btn btn-primary" data-link="/login">Go to login</button>
        </div>

        <!-- Error -->
        <div id="email-confirm-error" hidden>
          <h5 class="fw-bold">Error</h5>
          <p id="email-confirm-error-msg">Something didn't work!</p>
          <button class="btn btn-primary">Renvoyer un Email</button>
        </div>

      </auth-layout>
    `;
    const queryString = location.search;
    const params = new URLSearchParams(queryString);
    const uidb64 = params.get('uidb64');
    const token = params.get('token');
    try{
      const response1 = await fetch(`${BASE_URL}:8001/accounts/is_user_active/${uidb64}/${token}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data1 = await response1.json();
      if (data1.success) {
        // if (data.message) this.querySelector('#email-confirm-success').textContent = data.message;
        this.querySelector('#email-confirm-loading').hidden = true;
        this.querySelector('#email-confirm-success').hidden = false;
      } else {
        const csrfToken = await getCsrfToken();
        const response = await fetch(`${BASE_URL}:8001/accounts/activate/${uidb64}/${token}`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
        });
        const data = await response.json();
        this.querySelector('#email-confirm-loading').hidden = true;
        if (data.success) {
          // if (data.message) this.querySelector('#email-confirm-success').textContent = data.message;
          this.querySelector('#email-confirm-success').hidden = false;
        } else {
          if (data.message) {
            this.querySelector('#email-confirm-error-msg').textContent = data.message;
          }
          this.querySelector('#email-confirm-error').hidden = false;
        }
      }
      const resendButton = this.querySelector('#email-confirm-error button.btn');
      // Ajoutez un gestionnaire d'événements pour le clic sur le bouton "Renvoyer un Email"
      resendButton.addEventListener('click', async () => {
        // Masquez le message d'erreur
        this.querySelector('#email-confirm-error').hidden = true;
  
        // Affichez le message "Loading..." pendant la requête
        this.querySelector('#email-confirm-loading').hidden = false;
  
        // Effectuez une nouvelle demande de confirmation par e-mail
        const csrfToken = await getCsrfToken();
        const response = await fetch(`${BASE_URL}:8001/accounts/resend_email_confirmation/${uidb64}`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
        });
        const data = await response.json();
      });
    }
    catch(error){
      console.error('Erreur:', error);
      notify({
        icon: 'error',
        iconClass: 'text-danger',
        message: 'email confiramtion failed!',
      });
    }
  }
}
customElements.define('view-email-confirmation', ViewEmailConfirmation);
