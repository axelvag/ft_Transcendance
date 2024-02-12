import '../components/layouts/auth-layout.ce.js';

class ViewEmailConfirmation extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
        <login-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-gradient">Email confirmation</span>
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

      </login-layout>
    `;
    console.log(document.location.href);
    const hash = location.hash;
    const queryString = hash.slice(hash.indexOf('?') + 1);
    const params = new URLSearchParams(queryString);
    const uidb64 = params.get('uidb64');
    const token = params.get('token');
    console.log(uidb64);
    console.log(token);

    const response1 = await fetch(`http://127.0.0.1:8001/accounts/is_user_active/${uidb64}/${token}`);
    const data1 = await response1.json();
    if (data1.success) {
      // if (data.message) this.querySelector('#email-confirm-success').textContent = data.message;
      console.log("user Actif");
      this.querySelector('#email-confirm-loading').hidden = true;
      this.querySelector('#email-confirm-success').hidden = false;
    }
    else {
      const response = await fetch(`http://127.0.0.1:8001/accounts/activate/${uidb64}/${token}`);
      const data = await response.json();
      console.log(data);
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
      const response = await fetch(`http://127.0.0.1:8001/accounts/resend_email_confirmation/${uidb64}`);
      const data = await response.json();
    });
  }
}
customElements.define('view-email-confirmation', ViewEmailConfirmation);