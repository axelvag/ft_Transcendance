import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { isAuthenticated } from '@/auth.js';
import { redirectTo } from '@/router.js';

class ViewForgetPass extends HTMLElement {
  connectedCallback() {
    const isAuth = isAuthenticated();
    if (isAuth) {
      redirectTo('/dashboard');
    } else {
      this.displayDashboard();
    }
  }

  displayDashboard() {
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
              Envoyer
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

    let csrfToken;
    try {
      const response = await fetch('http://127.0.0.1:8001/accounts/get-csrf-token/', {
        method: 'GET',
        credentials: 'include', // Pour inclure les cookies dans la requête
      });
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du CSRF token: ${response.statusText}`);
      }
      const data = await response.json();
      csrfToken = data.csrfToken;
    } catch (error) {
      console.error('Erreur lors de la récupération du CSRF token:', error);
      // Gérer l'erreur (par exemple, afficher un message d'erreur à l'utilisateur)
      return;
    }

    const formData = {
      email: email,
    };
    console.log(JSON.stringify(formData));
    const response = await fetch('http://127.0.0.1:8001/accounts/password_reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    const data = await response.json();
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
