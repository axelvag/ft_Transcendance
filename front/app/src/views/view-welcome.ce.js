import logoSvg from '@/assets/img/logo.svg?raw';
import { toggleTheme } from '@/theme.js';
import '@/game/components/game-demo.ce.js';
import { getCsrfToken } from '@/auth.js';
import { user } from '@/auth.js';
import { redirectTo } from '@/router.js';

class ViewWelcome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar navbar-expand-lg fixed-top z-2">
        <div class="container-fluid">
          <a class="navbar-brand d-flex" href="#" data-link="/">
            ${logoSvg}
          </a>
          <button class="navbar-toggler border-0 p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">
            <ui-icon name="menu" class="fs-3"></ui-icon>
          </button>
          <div
            class="offcanvas offcanvas-end"
            tabindex="-1"
            id="offcanvas"
            aria-labelledby="offcanvasLabel"
            style="--bs-offcanvas-width: 15rem; --bs-offcanvas-border-color: rgba(var(--bs-dark-rgb), 0.25);"
          >
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasLabel">MENU</h5>
              <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-2">
                <li class="nav-item mx-lg-2">
                  <a class="nav-link" href="#" data-link="/login">Log in</a>
                </li>
                <li class="nav-item mx-lg-2">
                  <a class="nav-link" href="#" data-link="/signup">Sign up</a>
                </li>
                <li class="nav-item mx-lg-2 py-2 py-lg-1 col-12 col-lg-auto">
                  <div class="navbar-text p-0 vr d-none d-lg-flex h-100 y-2 mx-2"></div>
                  <hr class="navbar-text p-0 d-lg-none my-2">
                </li>
                <li class="nav-item mx-lg-2">
                  <a class="nav-link p-0 theme-toggle" href="#">
                    <span class="fs-4">
                      <ui-icon name="moon" class="dark-visible"></ui-icon>
                      <ui-icon name="sun" class="dark-hidden"></ui-icon>
                    </span>
                    <span class="ms-2 d-lg-none">Toggle theme</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <section class="min-vh-100 d-flex align-items-center pt-5 halo-bicolor">
        <div class="container text-center text-lg-start">
          <div class="row align-items-center">
            <div class="col-12 col-lg-6">
              <h1 class="display-3 fw-bold mb-4">
                Ultimate <span class="text-bicolor">Pong</span> Game 
              </h1>
              <p class="fs-3 fw-semibold mb-4">
                Engage in the classic battle with friends or solo, online and offline.
              </p>
              <p class="pt-3">
                <a class="btn btn-primary px-sm-5 py-sm-3 fw-bold" href="#" data-link="/game">
                  Play now
                </a>
              </p>
            </div>
            <div class="col-12 col-lg-6">
                <game-demo class="d-block p-5 mx-5 mt-n4 mt-lg-4 mx-lg-0"></game-demo>
            </div>
          </div>
        </div>
      </section>
    `;

    this.querySelector('.theme-toggle')?.addEventListener('click', e => {
      e.preventDefault();
      toggleTheme();
    });

    this.handleOAuthResponse();
  }
  async handleOAuthResponse() {
    // Vérifier si l'URL contient un paramètre `code`
    if (window.location.search.includes("code=")) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log(code);
        const csrfToken = await getCsrfToken();
        // Envoyer le code d'autorisation au serveur pour obtenir un token d'accès
        fetch('http://127.0.0.1:8001/accounts/oauth/callback/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify({ code: code })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Traiter la réponse
            if (data.access_token) {
                // Par exemple, rediriger l'utilisateur ou afficher un message de succès
                localStorage.setItem('isLogged', 'true');
                user.isAuthenticated = true;
                user.id = data.id;
                user.email = data.email;
                user.username = data.username;
                user.avatar = data.avatar.link;
                user.first_name = data.first_name;
                user.last_name = data.last_name;
                console.log(user.avatar);
                redirectTo('/dashboard'); // Mettez à jour selon votre logique de navigation
            }
        })
        .catch(error => console.error('Erreur:', error));
    }
}
}

customElements.define('view-welcome', ViewWelcome);
