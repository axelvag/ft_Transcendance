import '../components/layouts/auth-layout.ce.js';
import { redirectTo } from '@/router.js';

class ViewSigUp extends HTMLElement {
  constructor() {
    super();
    this.submitForm = this.submitForm.bind(this);
  }
  connectedCallback() {
    this.innerHTML = `
        <login-layout>
        <h1 class="fw-bold py-2 mb-4">
        <span class="text-gradient">Sign up</span>
        </h1>
        <form id="signup-form">
        <div class="mb-4">
          <label class="form-label opacity-50" for="email">
            Your email
          </label>
          <input class="form-control form-control-lg" type="email" id="email" name="email" required />
          <div id="email-error" class="invalid-feedback"></div>
        </div>
          <div class="mb-4">
            <label class="form-label opacity-50" for="username">
              Choose your username
              </label>
            <input class="form-control form-control-lg" type="username" id="username" name="username" required />
            <div id="username-error" class="invalid-feedback"></div>
          </div>
            
            <div class="mb-4">
              <label class="form-label opacity-50" for="password1">Choose your password</label>
              <input class="form-control form-control-lg" type="password" id="password1" name="password1" required />
            </div>
            <div class="mb-4">
              <label class="form-label opacity-50" for="password2">Repeat your password</label>
              <input class="form-control form-control-lg" type="password" id="password2" name="password2" required />
              <div id="password-error" class="invalid-feedback"></div>
            </div>
            
            <div class="d-grid pt-3">
              <button type="submit" class="btn btn-primary btn-lg fw-bold">
                Sign up
              </button>
            
              <div id="success-notification" class="alert alert-success mt-3" style="display: none;">
                <strong>Success!</strong> Registration successful! Please check your email for further instructions.
              </div>
              <div id="general-error" class="alert alert-danger mt-3" style="display: none;"></div>
              <div class="text-center pt-4">
                <a href="#" data-link="/login" class="link fw-bold text-decoration-none">
                  I already have an account
                </a>
              </div>
            </div>
            </form>
      </login-layout>
    `;

    //For function
    this.passwordVerification = this.passwordVerification.bind(this);
    this.resetError = this.resetError.bind(this);

    //Variable
    this.username = document.getElementById('username');
    this.email = document.getElementById('email');
    this.emailError = document.getElementById('email-error');
    this.usernameError = document.getElementById('username-error');
    this.password1 = document.getElementById('password1');
    this.password2 = document.getElementById('password2');
    this.passwordError = document.getElementById('password-error');
    this.generalError = document.getElementById('general-error');

    //Event
    // this.displayFormErrors = this.displayFormErrors.bind(this);
    this.querySelector('#signup-form').addEventListener('submit', this.submitForm);
    //Todo a revoir
    this.querySelector('a[data-link="/login"]').addEventListener('click', function (e) {
      e.preventDefault();
      redirectTo('/login');
    });

    this.querySelector('#signup-form').addEventListener('click', e => e.stopPropagation());
  }

  disconnectedCallback() {
    this.querySelector('#signup-form').removeEventListener('submit', this.submitForm);
  }

  passwordVerification = () => {
    if (this.password1.value !== this.password2.value) {
      this.passwordError.textContent = 'The passwords do not match.';
      this.password1.classList.add('is-invalid');
      this.password2.classList.add('is-invalid');
      console.log('password !=');
      return false;
    }

    const minLength = 8;
    const Uppercase = /[A-Z]/.test(this.password1.value);
    const Lowercase = /[a-z]/.test(this.password1.value);
    const Number = /\d/.test(this.password1.value);
    const SpecialChar = /[^A-Za-z0-9]/.test(this.password1.value);

    if (this.password1.length < minLength || !Uppercase || !Lowercase || !Number || !SpecialChar) {
      this.passwordError.textContent =
        'The password must contain at least 8 characters, an upper case letter, a lower case letter, a number and a special character.';
      this.password1.classList.add('is-invalid');
      this.passwordError.style.display = 'block';
      return false;
    }
    return true;
  };

  async submitForm(event) {
    event.preventDefault();
    // debugger;
    this.resetError();

    let verif = this.passwordVerification();
    if (!verif) return;

    // Ajout : Récupération du CSRF Token
    // let csrfToken;
    // try {
    //   const response = await fetch('http://127.0.0.1:8001/accounts/get-csrf-token/', {
    //     method: 'GET',
    //     credentials: 'include', // Pour inclure les cookies dans la requête
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Erreur lors de la récupération du CSRF token: ${response.statusText}`);
    //   }
    //   const data = await response.json();
    //   csrfToken = data.csrfToken;
    //   console.log(csrfToken);
    // } catch (error) {
    //   console.error('Erreur lors de la récupération du CSRF token:', error);
    //   // Gérer l'erreur (par exemple, afficher un message d'erreur à l'utilisateur)
    //   return;
    // }

    const formData = {
      username: this.username.value,
      email: this.email.value,
      password1: this.password1.value,
      password2: this.password2.value,
    };

    const response = await fetch('http://127.0.0.1:8001/accounts/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken,
        'X-CSRFToken': this.getCSRFToken(),
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log('data', data);

    if (data.success) {
      const successNotification = document.getElementById('success-notification');
      if (successNotification) successNotification.style.display = 'block';
      // redirectTo('/profil');
    } else {
      if (data.errors.email) {
        this.emailError.textContent = data.errors.email[0];
        this.email.classList.add('is-invalid');
      } else if (data.errors.password2) {
        this.passwordError.textContent = data.errors.password2[0];
        this.password1.classList.add('is-invalid');
        this.password2.classList.add('is-invalid');
      } else if (data.errors.username) {
        this.usernameError.textContent = data.errors.username[0];
        this.username.classList.add('is-invalid');
      } else {
        this.generalError.textContent = data.errors.non_field_errors[0]; // categorie special d'erreur
        this.generalError.style.display = 'block';
      }
    }
  }
  getCSRFToken() {
    const csrfTokenCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    if (csrfTokenCookie) {
      console.log("csrf find");
      return csrfTokenCookie.split('=')[1];
    }
    console.log("csrf not find");
    return null; // Retourne null si le cookie CSRF n'est pas trouvé
  }

  resetError = () => {
    this.email.classList.remove('is-invalid');
    this.password1.classList.remove('is-invalid');
    this.password2.classList.remove('is-invalid');
    this.username.classList.remove('is-invalid');

    this.emailError.textContent = '';
    this.usernameError.textContent = '';
    this.passwordError.textContent = '';
  };
}

customElements.define('view-signup', ViewSigUp);
