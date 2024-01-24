import '../components/layouts/auth-layout.ce.js';

class ViewSigUp extends HTMLElement {
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

    this.querySelector('#signup-form').addEventListener('submit', this.submitForm.bind(this));
  }

  async submitForm(event) {
    console.log("Click submit !");
    event.preventDefault();
    const form = event.target;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password1 = document.getElementById("password1").value;
    const password2 = document.getElementById("password2").value;
    const formData = {
      username: username,
      email: email,
      password1: password1,
      password2: password2,
  };
    console.log(JSON.stringify(formData));
    //to do
    // const csrfToken = this.getCSRFToken();
    // const response = await fetch(
    //   "http://127.0.0.1:8000/accounts/get-csrf-token/",
    //   {
      //       method: "GET",
    //       credentials: "include",
    //   }
    // )
    // console.log('response', response);
    // const data = await response.json();
    // const csrfToken = data.csrfToken;
    // .then((response) => response.json())
    // .then((data) => {
      //     const csrfToken = data.csrfToken;
      //     console.log(csrfToken)
      
      // Perform the AJAX request
      // console.log(csrfToken)
    const response = await fetch("http://127.0.0.1:8000/accounts/register/", {
        method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // 'X-CSRFToken': csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
    const data =  await response.json();
    if (data.success) {
        alert('success');
    } else {
      alert('errors');
      console.log(data.errors);
    }
  }

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
  
}

customElements.define('view-signup', ViewSigUp);