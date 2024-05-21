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
        <div id="email-error" class="alert alert-danger mt-4" style="display: none;">Wrong email.</div>
        <div id="success-notification" style="display: none;">
          <div class="alert alert-success mb-4">
            <div class="mb-2"><strong>Reset successful!</strong></div>
            <div>Please check your email for further instructions.</div>
          </div>
          <div class="d-grid">
            <a href="#" data-link="/login" class="btn btn-primary btn-lg fw-bold">
              Go to Login
            </a>
          </div>
        </div>
      </auth-layout>
    `;

    this.emailError = this.querySelector('#email-error');
    this.querySelector('#pass-form').addEventListener('submit', this.submitForm.bind(this));
  }

  async submitForm(event) {
    event.preventDefault();
    this.emailError.style.display = 'none';
    const form = event.target;
    const email = document.getElementById('email').value;

    const csrfToken = await getCsrfToken();

    const formData = {
      email: email,
    };
    const data = await passwordReset(formData, csrfToken);
    if (data.success) {
      const successNotification = document.getElementById('success-notification');
      if (successNotification) successNotification.style.display = 'block';
      document.getElementById('pass-form').style.display = 'none';
    } else {
      this.emailError.style.display = 'block';
    }
  }
}

customElements.define('view-forget-pass', ViewForgetPass);
