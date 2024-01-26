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
          <button class="btn btn-primary">Click here</button>
        </div>

      </login-layout>
    `;

    const params = new URL(document.location).searchParams;
    console.log(params);
    const uidb64 = params.get("uidb64");
    const token = params.get("token");
    console.log(uidb64);
    console.log(token);
    const response = await fetch(`http://127.0.0.1:8000/accounts/activate/${uidb64}/${token}`);
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
  
}

customElements.define('view-email-confirmation', ViewEmailConfirmation);