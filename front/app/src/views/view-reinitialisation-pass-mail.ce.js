import '@/components/layouts/auth-layout.ce.js';

class ViewForgetPass extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <login-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-gradient">Réinitialisation mot de passe</span>
        </h1>
        <form id="pass-form">
        <div class="mb-4">
          <label class="form-label opacity-50" for="email">
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
      </login-layout>
    `;

    this.querySelector('#pass-form').addEventListener('submit', this.submitForm.bind(this));
  }

  async submitForm(event) {
    event.preventDefault();
    console.log('Click submit !');
    const form = event.target;
    const email = document.getElementById('email').value;
    const formData = {
      email: email,
    };
    console.log(JSON.stringify(formData));
    const response = await fetch('http://127.0.0.1:8001/accounts/password_reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken
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
