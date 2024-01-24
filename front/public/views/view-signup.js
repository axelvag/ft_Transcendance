import '../components/layouts/auth-layout.ce.js';
import { redirectTo } from './../router.js';

class ViewSigUp extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <login-layout>
        <h1 class="fw-bold py-2 mb-4">
          <span class="text-gradient">Sign up</span>
        </h1>
        <form>
        <div class="mb-4">
          <label class="form-label opacity-50" for="email">
            Your email
          </label>
          <input class="form-control form-control-lg" type="email" id="email" name="email" required />
        </div>
          <div class="mb-4">
            <label class="form-label opacity-50" for="username">
              Choose your username
            </label>
            <input class="form-control form-control-lg" type="username" id="username" name="username" required />
          </div>
          <div class="mb-4">
            <label class="form-label opacity-50" for="password">
              Choose your password
            </label>
            <input class="form-control form-control-lg" type="password" id="password" name="password" required />
          </div>
          <div class="mb-4">
            <label class="form-label opacity-50" for="password">
              Repeat your password
            </label>
            <input class="form-control form-control-lg" type="password" id="password" name="password" required />
          </div>
          <div class="d-grid pt-3">
            <button type="submit" class="btn btn-primary btn-lg fw-bold">
              Sign up
            </button>
            <div class="text-center pt-4">
              <a href="#" data-link="/login" class="link fw-bold text-decoration-none">
                I already have an account
              </a>
            </div>
          </div>
        </form>
      </login-layout>
    `;

    this.querySelector('form').addEventListener('submit', this.submitForm.bind(this));
  }

  submitForm(event) {
    console.log('Click submit !');
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const csrfToken = this.getCSRFToken();

    
    setTimeout(() => {
      redirectTo('/profil');
    }, 2000);
  }
}

customElements.define('view-signup', ViewSigUp);

// Perform the AJAX request
// fetch('http://127.0.0.1:8000/accounts/register/', {
//   method: 'POST',
//   body: formData,
//   headers: {
//     'X-CSRFToken': csrfToken,
//   },
// })
//   .then(response => response.json())
//   .then(data => {
//     if (data.success) {
//       console.log('Registration successful:', data.message);
//       redirectTo('/profile');
//     } else console.error('Registration failed:', data.message);
//   })
//   .catch(error => {
//     console.error('Error during fetch:', error);
//   });

  // getCSRFToken() {
  //   const cookies = document.cookie.split(';');
  //   for (let i = 0; i < cookies.length; i++) {
  //     let cookie = cookies[i].trim();
  //     if (cookie.startsWith('csrftoken=')) {
  //       return cookie.substring('csrftoken='.length);
  //     }
  //   }
  //   return '';
  // }