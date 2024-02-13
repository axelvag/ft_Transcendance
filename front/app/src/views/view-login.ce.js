import '@/components/layouts/auth-layout.ce.js';
import { redirectTo } from '@/router.js';

class ViewSignIn extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <login-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-gradient">Log In</span>
        </h1>
        <form id="signin-form">
          <div class="mb-4">
            <label class="form-label opacity-50" for="username">
              Username
            </label>
            <input class="form-control form-control-lg" type="username" id="username" name="username" required />
          </div>
          <div class="mb-4">
            <div class="d-flex justify-content-between">
              <label class="form-label opacity-50" for="password">
                Password
              </label>
              <a href="#" class="link fw-bold text-decoration-none">
                Forgot password?
              </a>
            </div>
            <input class="form-control form-control-lg" type="password" id="password" name="password" required />
            <div id="password-error" class="alert alert-danger mt-4" style="display: none;">Identifiants ou mot de passe incorrects.</div>
            <div id="email-error" class="alert alert-danger mt-4" style="display: none;">Verifier vos emails.</div>
          </div>
          <div class="d-grid pt-3">
            <button type="submit" class="btn btn-primary btn-lg fw-bold">
              Log In
            </button>
            <div class="text-center pt-4">
              <a href="#" data-link="/signup" class="link fw-bold text-decoration-none">
                Create an account
              </a>
            </div>
          </div>
        </form>
      </login-layout>
    `;

    this.querySelector('#signin-form').addEventListener('submit', this.submitForm.bind(this));
    this.passwordError = this.querySelector('#password-error');
    this.emailError = this.querySelector('#email-error');
  }

  async submitForm(event) {
    event.preventDefault();

    this.emailError.style.display = 'none';
    this.passwordError.style.display = 'none';

    const form = event.target;
    const usernameOremail = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const formData = {
      username: usernameOremail,
      password: password,
    };

    console.log(JSON.stringify(formData));
    const response = await fetch('http://127.0.0.1:8001/accounts/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log('error', data);
    if (data.success) {
      localStorage.setItem('username', data.username);
      console.log('Sucess!');
      redirectTo('/dashboard');
      // alert('success');
    } else {
      if (data.message === 'User not active.') this.emailError.style.display = 'block';
      else if (data.message === 'Invalid username or password.') this.passwordError.style.display = 'block';
    }
  }
}

customElements.define('view-signin', ViewSignIn);
