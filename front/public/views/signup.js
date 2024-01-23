import '../components/layouts/auth-layout.ce.js';

const template = `
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
        <label class="form-label opacity-50" for="password">
          Choose your password
        </label>
        <input class="form-control form-control-lg" type="password" id="password1" name="password1" required />
      </div>
      <div class="mb-4">
        <label class="form-label opacity-50" for="password">
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

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('signup-form-container');
  if (container) {
    container.innerHTML = template;
    console.log("ici");
    // Maintenant que le formulaire est ajouté au DOM, attachez l'écouteur d'événements.
    const form = document.getElementById('signup-form');
    if (form) {
      form.addEventListener('submit', function(event) {
        console.log("ici");
        event.preventDefault();
        sendFormData();
      });
    } else {
      console.error('Le formulaire ne peut pas être trouvé après son insertion dans le DOM.');
    }
  } else {
    console.error('Le conteneur pour insérer le formulaire n\'existe pas.');
  }
});

function sendFormData() {
  const formData = new FormData(document.getElementById('signup-form'));
  console.log(formData);
  fetch(
    "https://127.0.0.1:8000/accounts/get-csrf-token/",
    {
        method: "GET",
        credentials: "include",
    }
)
    .then((response) => response.json())
    .then((data) => {
        const csrfToken = data.csrfToken;
        console.log(csrfToken)
        fetch(
            "https://127.0.0.1:8000/accounts/register/",
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    userData,
                }),
            }
        )
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error("Login failed", error);
                // Handle login failure (show error message, etc.)
            });
    })
    .catch((error) => {
        console.error("get csrf token fail", error);
    });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default template;
