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

    //Event
    // this.displayFormErrors = this.displayFormErrors.bind(this);
    this.querySelector('#signup-form').addEventListener('submit', this.submitForm.bind(this));
  }

  passwordVerification = () => {
  
    if (this.password1.value !== this.password2.value) {
      this.passwordError.textContent = 'The passwords do not match.';
      this.password1.classList.add('is-invalid');
      this.password2.classList.add('is-invalid');
      // this.passwordError.style.display = 'block';
      console.log("password !=");
      return false;
    } 
    
    const minLength = 8;
    const Uppercase = /[A-Z]/.test(this.password1.value);
    const Lowercase = /[a-z]/.test(this.password1.value);
    const Number = /\d/.test(this.password1.value);
    const SpecialChar = /[^A-Za-z0-9]/.test(this.password1.value);

    if (this.password1.length < minLength || !Uppercase || !Lowercase || !Number || !SpecialChar){
      console.log("Je rentre ici");
      this.passwordError.textContent = 'The password must contain at least 8 characters, an upper case letter, a lower case letter, a number and a special character.';
      this.password1.classList.add('is-invalid');
      this.passwordError.style.display = 'block';
      return false;
    }

    return true;
  }
  

  async submitForm(event) {

    console.log('Click submit !');
    event.preventDefault();

    this.resetError();

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

      // const data = await response.json();
      // // console.log("test");
      // if (response.ok){
      //   const successNotification = document.getElementById('success-notification');
      //   console.log("var-->", successNotification);
      //   if (successNotification)
      //     successNotification.style.display = 'block';
      // }
      // else if (data.errors.email){
      //   this.emailError.textContent = data.errors.email[0];
      //   this.email.classList.add('is-invalid');
      // }
      // else if (data.errors.password2){
      //   this.usernameError.textContent = data.errors.password2[0];
      //   this.username.classList.add('is-valid');
      // }
    const data = await response.json(); 
    console.log("data", data);

    if (data.errors.email){
        console.log("pussy");
      this.emailError.textContent = data.errors.email[0];
      this.email.classList.add('is-invalid');
    }
    else if (data.errors.password2){
        console.log("puddwdwdwdwssy");
        this.usernameError.textContent = data.errors.password2[0];
        this.username.classList.add('is-valid');
    }
    else{
        console.log("Formulaire --> Sucess");
        const successNotification = document.getElementById('success-notification');
        // successNotification.classList.remove('alert-success');
        console.log("var-->", successNotification);
        if (successNotification)
          successNotification.style.display = 'block';
    }
    
    }
    
    resetError = () => {
      this.email.classList.remove('is-invalid');
      this.password1.classList.remove('is-invalid');
      this.password2.classList.remove('is-invalid');
      this.usernameError.classList.remove('is-valid');

      this.emailError.textContent = '';
      this.usernameError.textContent = '';
      this.passwordError.textContent = '';
    }
  }

  customElements.define('view-signup', ViewSigUp);

  
  //to do
  // [x] Gestions des mots de passes (Les deux egaux)
// [x] Verifier que l'adresse mail n'est pas utilise
// [x] Verifier que l'adress mail contient bien un @
// [x] Tous les champs sont rempli

// [x] Verifier que le mot de passe contient : 8 caractere, 1 lettre minuscule, 1 lettre majuscule, et un carcatere special et un chiffre
//       - 8 caractere
//       - 1 lettre minuscule
//       - 1 lettre majuscule
//       - un carcatere special
//       - un chiffre

// [x] Gerer erreur mdp errone plus juste mais mauvaise adress mail, le message d'erreur des mdp est encore la
// [x!] Gerer quand ca sucess de mettre un message comme quoi ca a marche
// [x!] Mettre un message check your emai
// [] Si form a des erreurs avant, et que ensuite ca sucess, le message de sucess ne s'affiche pas


// if (data.errors) {
//   Object.keys(data.errors).forEach((key) => {
  //     console.log("key ", key);
  //     const errorElement = this.querySelector(`#${key}-error`);
  //     if (errorElement) {
    //       errorElement.textContent = data.errors[key][0];
    //       this[key].classList.add('is-invalid');
    //     }
    //   });
    // } else {
      //   // Afficher le message de succès si aucune erreur n'est retournée
      //   const successNotification = document.getElementById('success-notification');
      //   if (successNotification) successNotification.style.display = 'block';
      // }

      // ['email', 'password1', 'password2', 'username'].forEach((field) => {
      //   const input = this[field];
      //   const errorElement = this.querySelector(`#${field}-error`);
      //   if (input) input.classList.remove('is-invalid');
      //   if (errorElement) errorElement.textContent = '';
      // });

//Qwertyuiop123.