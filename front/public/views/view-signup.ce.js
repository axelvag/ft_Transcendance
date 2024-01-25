import '../components/layouts/auth-layout.ce.js';

class ViewSigUp extends HTMLElement {
  
  constructor(){
    super();
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
        </div>
          <div class="mb-4">
            <label class="form-label opacity-50" for="username">
              Choose your username
              </label>
            <input class="form-control form-control-lg" type="username" id="username" name="username" required />
            </div>
            
            <div class="mb-4">
            <label class="form-label opacity-50" for="password1">Choose your password</label>
            <input class="form-control form-control-lg" type="password" id="password1" name="password1" required />
            </div>
            <div class="mb-4">
            <label class="form-label opacity-50" for="password2">Repeat your password</label>
            <input class="form-control form-control-lg" type="password" id="password2" name="password2" required />
            <div id="password-error" class="invalid-feedback">Les mots de passe ne correspondent pas.</div>
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
    
    this.passwordVerification = this.passwordVerification.bind(this);
    this.username = document.getElementById('username');
    this.email = document.getElementById('email');
    this.password1 = document.getElementById('password1');
    this.password2 = document.getElementById('password2');
    this.passwordError = document.getElementById('password-error');
    this.querySelector('#signup-form').addEventListener('submit', this.submitForm.bind(this));
  }

  passwordVerification = () => {
  
    if (this.password1.value !== this.password2.value) {
      // this.passwordError.textContent = 'Les mots de passe ne correspondent pas.';
      this.password1.classList.add('is-invalid');
      this.password2.classList.add('is-invalid');
      // this.passwordError.style.display = 'block';
      return false;
    } else {
      this.password1.classList.remove('is-invalid');
      this.password2.classList.remove('is-invalid');
      // this.passwordError.style.display = 'none';
      return true;
    }
  }
  

  async submitForm(event) {

    console.log('Click submit !');
    event.preventDefault();
    // const form = event.target;

    let verif = this.passwordVerification();
    if (!verif){
      console.log("YEPPPPP");
      return;
    }

    console.log("toto");
    const formData = {
      username: this.username.value,
      email: this.email.value,
      password1: this.password1.value,
      password2: this.password2.value,
    };

    console.log(JSON.stringify(formData));

    const response = await fetch('http://127.0.0.1:8000/accounts/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      alert('success');3
    } else {
      alert('errors');
      console.log(data.errors);
    }
  }
}

customElements.define('view-signup', ViewSigUp);

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


//to do
// [ ] Gestions des mots de passes (Les deux egaux)
// [ ] Verifier que l'adresse mail n'est pas utilise
// [ ] Verifier que l'adress mail contient bien un @
// [ ] Tous les champs sont rempli

// [ ] Verifier que le mot de passe contient : 8 caractere, 1 lettre minuscule, 1 lettre majuscule, et un carcatere special et un chiffre
//       - 8 caractere
//       - 1 lettre minuscule
//       - 1 lettre majuscule
//       - un carcatere special
//       - un chiffre