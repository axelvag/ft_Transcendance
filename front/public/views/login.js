import '../components/layouts/auth-layout.ce.js';
import { redirectTo } from '../router.js';

// const template = `
//   <login-layout>
//     <h1 class="fw-bold py-2 mb-4">
//       <span class="text-gradient">Log In</span>
//     </h1>
//     <form>
//       <div class="mb-4">
//         <label class="form-label opacity-50" for="username">
//           Username
//         </label>
//         <input class="form-control form-control-lg" type="username" id="username" name="username" required />
//       </div>
//       <div class="mb-4">
//         <div class="d-flex justify-content-between">
//           <label class="form-label opacity-50" for="password">
//             Password
//           </label>
//           <a href="#" class="link fw-bold text-decoration-none">
//             Forgot password?
//           </a>
//         </div>
//         <input class="form-control form-control-lg" type="password" id="password" name="password" required />
//       </div>
//       <div class="d-grid pt-3">
//         <button type="submit" data-link="/" class="btn btn-primary btn-lg fw-bold">
//           Log In
//         </button>
//         <div class="text-center pt-4">
//           <a href="#" data-link="/signup" class="link fw-bold text-decoration-none">
//             Create an account
//           </a>
//         </div>
//       </div>
//     </form>
//   </login-layout>
// `;

// export default template;

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
              <a href="#" data-link="/forget-pass" class="link fw-bold text-decoration-none">
                Forgot password?
              </a>
            </div>
            <input class="form-control form-control-lg" type="password" id="password" name="password" required />
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
  }

  async submitForm(event) {
    console.log("Click submit !");
    event.preventDefault();
    const form = event.target;
    const usernameOremail = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const formData = {
      username: usernameOremail,
      password: password,
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
    const response = await fetch("http://127.0.0.1:8000/accounts/login/", {
        method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // 'X-CSRFToken': csrfToken
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
    const data =  await response.json();
    console.log(data.username);
    if (data.success) {
      localStorage.setItem('username', data.username); 
      // window.user = { username: data.username };
      alert('success');
      redirectTo("/dashboard");
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

customElements.define('view-signin', ViewSignIn);