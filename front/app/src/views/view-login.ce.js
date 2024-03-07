import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';
import { getCsrfToken } from '@/auth.js';
import { loginUser } from '@/auth.js';

class ViewSignIn extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <auth-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-bicolor">Log In</span>
        </h1>
        <form id="signin-form">
          <div class="mb-4">
            <label class="form-label" for="username">
              Username
            </label>
            <input
              class="form-control form-control-lg"
              type="username"
              id="username"
              name="username"
              required
              autocomplete="username"
            />
          </div>
          <div class="mb-4">
            <div class="d-flex justify-content-between">
              <label class="form-label" for="password">
                Password
              </label>
              <a href="#" data-link="/forget-pass" class="link fw-bold text-decoration-none">
                Forgot password?
              </a>
            </div>
            <input
              class="form-control form-control-lg"
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
            />
            <div id="password-error" class="alert alert-danger mt-4" style="display: none;">Identifiants ou mot de passe incorrects.</div>
            <div id="email-error" class="alert alert-danger mt-4" style="display: none;">Verifier vos emails.</div>
          </div>
          <div id="OAuth42">
              <a href="#" id="OAuth-42">
              Se connecter avec 42
              </a>
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
      </auth-layout>
    `;

    // this.querySelector('a[data-link="/forget-pass"]').addEventListener('click', (event) => {
    //   event.preventDefault(); // Empêche le navigateur de suivre le lien
    //   console.log("ici forget pass");
    //   redirectTo('/forget-pass'); // Changez cette fonction selon votre logique de navigation
    // });

    this.querySelector('#signin-form').addEventListener('submit', this.submitForm.bind(this));
    this.passwordError = this.querySelector('#password-error');
    this.emailError = this.querySelector('#email-error');

    this.querySelector('#OAuth-42').addEventListener('click', event => {
      event.preventDefault();
      this.getAuthorizationCode();
    });
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

    const csrfToken = await getCsrfToken();
    try {
      const data = await loginUser(formData, csrfToken); // Utilisez la nouvelle fonction pour la requête
      console.log('error', data);
      if (data.success) {
          console.log('Sucess!');
          localStorage.setItem('isLogged', 'true');
          user.isAuthenticated = true;
          user.id = data.id;
          user.email = data.email;
          user.username = data.username;
          redirectTo('/dashboard'); // Assurez-vous que redirectTo est correctement importé
      }  else {
          if (data.message === 'User not active.') this.emailError.style.display = 'block';
          else if (data.message === 'Invalid username or password.') this.passwordError.style.display = 'block';
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
  }

  getAuthorizationCode() {
    const authorizationUrl =
        "https://api.intra.42.fr/oauth/authorize";
    const clientId =
        "u-s4t2ud-032700fdff8bf6b743669184234c5670698f0f0ef95b498514fc13b5e7af32f0";
    const redirectUri =
        "https%3A%2F%2F127.0.0.1%3A5500%2FWeb%2Fbackend%2Fauthentification%2Ftemplates%2Flogin_with42api.html";
    const responseType = "code";
    // const url = `${authorizationUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`;
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-032700fdff8bf6b743669184234c5670698f0f0ef95b498514fc13b5e7af32f0&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2F&response_type=code`;
    window.location.href = url;
  }  
}

customElements.define('view-signin', ViewSignIn);
