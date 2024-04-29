import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '@/router.js';
import { getCsrfToken } from '@/auth.js';
import { sendEmailPasswordReset } from '@/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ViewNewPass extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
      <auth-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-bicolor">New password</span>
        </h1>
        <div id="email-confirm-loading">Loading...</div>
        <div id="email-confirm-success" hidden>
          <form id="new-pass-form">
            <div class="mb-4">
              <label class="form-label" for="password1">
                Choose your new password
              </label>
              <input class="form-control form-control-lg" type="password" id="password1" name="password1" required />
            </div>
            <div class="mb-4">
              <label class="form-label" for="password2">
                Repeat your password
              </label>
              <input class="form-control form-control-lg" type="password" id="password2" name="password2" required />
            </div>
            <div class="d-grid pt-3">
              <button type="submit" class="btn btn-primary btn-lg fw-bold">
                Log In
              </button>
            </div>
          </form>
        </div>
        <div id="email-confirm-error" hidden>
          <h5 class="fw-bold">Error</h5>
          <p id="email-confirm-error-msg">Something didn't work!</p>
          <button class="btn btn-primary">Renvoyer un Email</button>
        </div>
      </auth-layout>
    `;

    const queryString = location.search;
    const params = new URLSearchParams(queryString);
    this.uidb64 = params.get('uidb64');
    const token = params.get('token');
    console.log(this.uidb64);
    console.log(token);
    const response = await fetch(API_BASE_URL + `/accounts/activate_mail_pass/${this.uidb64}/${token}`);
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
    // }
    this.querySelector('#new-pass-form').addEventListener('submit', this.submitForm.bind(this));
    const resendButton = this.querySelector('#email-confirm-error button.btn');
    // Ajoutez un gestionnaire d'événements pour le clic sur le bouton "Renvoyer un Email"
    resendButton.addEventListener('click', async () => {
      // Masquez le message d'erreur
      this.querySelector('#email-confirm-error').hidden = true;

      // Affichez le message "Loading..." pendant la requête
      this.querySelector('#email-confirm-loading').hidden = false;

      // Effectuez une nouvelle demande de confirmation par e-mail
      const response = await fetch(API_BASE_URL + `/accounts/resend_email_rest/${this.uidb64}`);
      const data = await response.json();
    });
  }

  async submitForm(event) {
    event.preventDefault();

    console.log('Click submit !');
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;

    const csrfToken = await getCsrfToken();

    const url = API_BASE_URL + `/accounts/password-change/${this.uidb64}`; // Ajout de uidb64 à l'URL
    console.log(url);
    const formData = {
      new_password: password1, // Assurez-vous que ces clés correspondent aux attentes de votre backend
      confirm_password: password2,
    };

    console.log(JSON.stringify(formData));
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-CSRFToken': csrfToken,
    //   },
    //   credentials: 'include',
    //   body: JSON.stringify(formData),
    // });

    const data = await sendEmailPasswordReset(formData, csrfToken, url);
    console.log(data);
    if (data.success) {
      redirectTo('/login');
      console.log('Success!');
      alert('success');
    } else {
      alert('errors');
      console.log(data.errors);
    }
  }
}

customElements.define('view-new-pass', ViewNewPass);
