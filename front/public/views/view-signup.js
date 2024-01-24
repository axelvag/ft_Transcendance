import '../components/layouts/auth-layout.ce.js';

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
            <label class="form-label opacity-50" for="password1">
              Choose your password
            </label>
            <input class="form-control form-control-lg" type="password" id="password1" name="password1" required />
          </div>
          <div class="mb-4">
            <label class="form-label opacity-50" for="password2">
              Repeat your password
            </label>
            <input class="form-control form-control-lg" type="password" id="password2" name="password2" required />
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

  async submitForm(event) {
    console.log("Click submit !");
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    // const formData = {
    //   'username': 'registerUser',
    //   'password1': 'Testpassword69',
    //   'password2': 'Testpassword69',
    //   'email': 'test@gmail.com'
    //   // autres champs nécessaires...
    // };
    // const dataToSend = JSON.stringify(formData);
    console.log(formData);
    // const csrfToken = this.getCSRFToken();
    const response = await fetch(
      "http://127.0.0.1:8000/accounts/get-csrf-token/",
      {
          method: "GET",
          credentials: "include",
      }
    )
    console.log('response', response);
    const data = await response.json();
    const csrfToken = data.csrfToken;
      // .then((response) => response.json())
      // .then((data) => {
      //     const csrfToken = data.csrfToken;
      //     console.log(csrfToken)

    // Perform the AJAX request
    console.log(csrfToken)
    fetch("http://127.0.0.1:8000/accounts/register/", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // 'X-CSRFToken': csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        formData,
      }),
    })
    .then(response => {
      console.log(response)
      return response.json()
    })
    .then(data => {
      if (data.success)
        console.log('Registration successful:', data.message);
      else
        console.error('Registration failed:', data.message);
    })
    .catch(error => {
      console.error('Error during fetch:', error);
    });
  }

  getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith('csrftoken=')) {
        return cookie.substring('csrftoken='.length);
      }
    }
    return '';
  }
  
}

customElements.define('view-signup', ViewSigUp);