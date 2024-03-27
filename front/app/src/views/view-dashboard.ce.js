import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
// import { redirectTo } from '@/router.js';
// import { user , getCsrfToken} from '@/auth.js';
import { user } from '@/auth.js';

class ViewDash extends HTMLElement {
  connectedCallback() {
    window.addEventListener('storage', (event) => {
    if (event.key === 'isLogged' && event.newValue === 'false') {
      // Logique pour gérer la déconnexion, par exemple :
      console.log("logout logout");
      window.location.href = '/login'; // Rediriger vers la page de connexion
      return;
    }
  });
    this.innerHTML = `
    <default-layout-sidebar></default-layout-sidebar>
    <default-layout-main>
      <div class="row">
        <div class="col-8">
          <div class="dashboard-text">
            <h1 class="text-bicolor display-5 fw-bolder">
              TRANSCENDANCE PONG
            </h1>
          </div>
        </div>
        <div class="col-4">
          <div class="row justify-content-end">
            <div class="col-md-6 d-flex flex-column align-items-center">
                <img src="assets/img/avatar_careers.jpg" class="img-thumbnail rounded-circle" width="200" height="200" alt="character">
                <h3 class="display-5 fw-bold btn-lg">
                  ${user.username}
                </h3>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center align-items-center mt-3" style="height: 20vh;">
        <div class="big-button-play rounded-3">
          <button type="button" class="btn btn-outline-light btn-lg" style="width: 400px; height: 180px; font-size: 4rem;" data-link="/game">
            Play Now
          </button>
        </div>
      </div>


      <!-- RANK -->

      <div class="d-flex justify-content-end mt-3">
        <a class="btn btn-outline-primary border-2 fw-semibold rounded-pill btn-lg ml-auto mt-5" style="--bs-btn-color: var(--bs-body-color); font-size: 2rem;" href="#" data-link="/rank">
          <span class="d-inline-block py-1">
            <img src="assets/img/rank-icon.png" alt="logo_rank" style="width: 50px; height: 50px; margin-right: 10px;">
            RANK
          </span>
        </a>
      </div>
        

    </default-layout-main>
    `;
  }
}

customElements.define('view-dash', ViewDash);
