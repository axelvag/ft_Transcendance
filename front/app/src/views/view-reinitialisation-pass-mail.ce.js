import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { getCsrfToken } from '@/auth.js';
import { passwordReset } from '@/auth.js';

class ViewForgetPass extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <auth-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-bicolor">Reset password</span>
        </h1>
        <form id="pass-form">
          <div class="mb-4">
            <label class="form-label" for="email">
              Your email
            </label>
            <input class="form-control form-control-lg" type="email" id="email" name="email" required />
          </div>
          <div class="d-grid pt-3">
            <button type="submit" class="btn btn-primary btn-lg fw-bold">
              Send
            </button>
          </div>
        </form>
      </auth-layout>
    `;

    this.querySelector('#pass-form').addEventListener('submit', this.submitForm.bind(this));
  }

  async submitForm(event) {
    event.preventDefault();
    console.log('Click submit !');
    const form = event.target;
    const email = document.getElementById('email').value;

    const csrfToken = await getCsrfToken();

    const formData = {
      email: email,
    };
    console.log(JSON.stringify(formData));
    const data = await passwordReset(formData, csrfToken);
    console.log(data);
    if (data.success) {
      // Redirection vers la page de connexion
      console.log('yoooooooooooooo');
      // window.location.href = "/login";
      alert('success');
    } else {
      alert('errors');
      console.log(data.errors);
    }
  }
}

customElements.define('view-forget-pass', ViewForgetPass);
