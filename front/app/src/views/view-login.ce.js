import '@/components/layouts/auth-layout/auth-layout.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';
import { getCsrfToken } from '@/auth.js';
import { loginUser, setLocalUser } from '@/auth.js';
import { getAuthorizationCode } from '@/auth.js';
import { notify } from '@/notifications.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ViewSignIn extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <auth-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-bicolor">Log In</span>
        </h1>
        <div id="OAuth42" class="d-grid">
          <a
            href="#"
            id="OAuth-42"
            class="btn btn-outline-bicolor border-2 btn-lg fw-bold"
            style="--bs-btn-border-width: 2px;"
          >
            Log In with
            <ui-icon class="ms-2" name="42"></ui-icon>
          </a>
        </div>
        <div class="d-flex align-items-center my-3">
          <hr class="flex-grow-1">
          <span class="flex-shrink-0 px-3 pb-1 fw-semibold">or</span>
          <hr class="flex-grow-1">
        </div>
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
      getAuthorizationCode();
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

    this.querySelector('auth-layout').setAttribute('loading', true);
    const csrfToken = await getCsrfToken();
    try {
      const data = await loginUser(formData, csrfToken);
      if (data.success) {
        setLocalUser(data);
        const userProfileResponse = await fetch(`https://127.0.0.1:8002/get_user_profile/${user.id}/`, {
          method: 'GET',
          headers: {
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
        });
        const userProfileData = await userProfileResponse.json();
        if (userProfileData.success) {
          setLocalUser(userProfileData);
        } else {
          console.error('Failed to load user profile:', userProfileData.message);
        }
        redirectTo('/dashboard');
        notify({
          icon: 'info',
          iconClass: 'text-info',
          message: `You habe been <b>logged in</b> successfully!</b>`,
        });
      } else {
        if (data.message === 'User not active.') this.emailError.style.display = 'block';
        else if (data.message === 'Invalid username or password.') this.passwordError.style.display = 'block';
      }
    } catch (error) {
      console.error('Login failed:', error);
      notify({
        icon: 'error',
        iconClass: 'text-danger',
        message: 'Login failed!',
      });
    }
    this.querySelector('auth-layout').removeAttribute('loading');
  }
}

customElements.define('view-signin', ViewSignIn);
