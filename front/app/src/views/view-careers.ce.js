import { redirectTo } from '@/router.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewCareers extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center" style="margin-top: -50px;">
          Statistic
        </h1>

        <!-- avatar and classement -->

        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <img src="https://pbs.twimg.com/media/E3-FSn5XwAMwOYR.jpg" class="img-thumbnail rounded-circle" width="200" height="200" alt="character">
            </div>
          </div>
          <div class="col-md-6 mt-5">
            <h1 class="display-5 fw-bold mb-4 text-center text-lg irish-grover extra-large" style="margin-left: -250px;">
              ${user.id} / 4
            </h1>
          </div>
        </div>

        <!-- Nom et RANK -->

        <div class="row">
          <div class="col-md-6">
            <h3 class="display-5 fw-bold btn-lg ms-5">
              ${user.username}
            </h3>
          </div>
          <div class="col-md-6" style="margin-top: -20px">
            <a class="btn btn-outline-primary border-2 fw-semibold rounded-pill btn-lg" style="--bs-btn-color: var(--bs-body-color); font-size: 2rem;" href="#" data-link="/game">
              <span class="d-inline-block py-1">
              <img src="https://static.vecteezy.com/system/resources/previews/028/754/694/non_2x/3d-purple-trophy-cup-winner-champion-icon-for-ui-ux-web-mobile-apps-social-media-ads-designs-png.png" alt="logo_rank" style="width: 50px; height: 50px; margin-right: 10px;">
              RANK
              </span>
            </a>
          </div>
        </div>

        <!-- Victories and Lost -->

        <div class="row mt-2">
          <div class="col-md-6">
            <div class="text-grey ms-4">
              <h2>
                Victories
              </h2>
            </div>
            <div class="btn border border-white rounded-pill btn-lg" style="font-size: 2rem; pointer-events: none;">
              <span class="d-inline-block py-1">
                <img src="https://static.vecteezy.com/system/resources/previews/028/754/694/non_2x/3d-purple-trophy-cup-winner-champion-icon-for-ui-ux-web-mobile-apps-social-media-ads-designs-png.png" alt="logo_victories" style="width: 50px; height: 50px; margin-right: 10px;">
                &nbsp;183&nbsp;&nbsp;
              </span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="text-grey ms-5">
              <h2>
                Lost
              </h2>
            </div>
            <div class="btn border border-white rounded-pill btn-lg" style="font-size: 2rem; pointer-events: none;">
              <span class="d-inline-block py-1">
                <img src="https://purplex.ca/wp-content/uploads/2023/03/purple-x-sigle.png" alt="logo_lost" style="width: 50px; height: 50px; margin-right: 10px;">
                &nbsp;13&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </div>

        <!-- Online and Local -->

        <div class="row mt-2">
          <div class="col-md-6">
            <div class="text-grey ms-4">
              <h2>
                Online
              </h2>
            </div>
            <div class="btn border border-white rounded-pill btn-lg" style="font-size: 2rem; pointer-events: none;">
              <span class="d-inline-block py-1">
                <img src="https://cdn-icons-png.flaticon.com/512/4562/4562970.png" alt="logo_online" style="width: 50px; height: 50px; margin-right: 10px;">
                &nbsp;160&nbsp;&nbsp;
              </span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="text-grey ms-5">
              <h2>
                Local
              </h2>
            </div>
            <div class="btn border border-white rounded-pill btn-lg" style="font-size: 2rem; pointer-events: none;">
              <span class="d-inline-block py-1">
                <img src="https://static.vecteezy.com/system/resources/previews/023/561/259/non_2x/purple-and-white-keyboard-icon-in-3d-render-png.png" alt="logo_local" style="width: 50px; height: 50px; margin-right: 10px;">
                &nbsp;27&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </div>

        <!-- Time play -->

        <div class="row">
        <div class="col-md-8 text-center text-grey">
          <h2>
            Time play
          </h2>
        </div>
        </div>

        <div class="row mt-2">
        <div class="col-md-8 d-flex justify-content-center">
          <div class="btn border border-white rounded-pill btn-lg" style="font-size: 2rem; pointer-events: none;">
            <span class="d-inline-block py-1">
              <img src="https://static.vecteezy.com/system/resources/previews/022/541/253/non_2x/3d-render-purple-pastel-color-alarm-clock-3d-circle-clock-icon-png.png" alt="logo_local" style="width: 50px; height: 50px; margin-right: 10px;">
              &nbsp;130H&nbsp;&nbsp;
            </span>
          </div>
        </div>
        </div>


      </default-layout-main>
    `;
  }

  
}
customElements.define('view-careers', ViewCareers);
