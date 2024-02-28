import { redirectTo } from '@/router.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewCareers extends HTMLElement {
  connectedCallback() {
    const isAuth = isAuthenticated();
    if (!isAuth) {
      redirectTo('/login');
    } else {
      this.render();
    }
  }

  render() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Irish+Grover&display=swap');
        .irish-grover {
            font-family: 'Irish Grover', cursive;
        }
        .extra-large {
          font-size: 9rem; /* Taille de police plus grande */
        }
      </style>


      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center" style="margin-top: -50px;">
          Statistic
        </h1>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <img src="https://robohash.org/4572b535a32e02ecef37ebf74c8d76a7?set=set2&bgset=&size=400x400" class="img-thumbnail rounded-circle" width="230" height="230" alt="character">
            </div>
          </div>
          <div class="col-md-6 mt-2">
            <h1 class="display-5 fw-bold mb-4 text-center text-lg irish-grover extra-large style="margin-left: -250px;"">
              ${user.id} / 4
            </h1>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <h3 class="display-5 fw-bold me-3 btn-lg" style="margin-left: 70px;">
              ${user.username}
            </h3>
          </div>
          <div class="col-md-6">
            <a class="btn btn-outline-primary border-2 fw-semibold rounded-pill btn-lg" style="--bs-btn-color: var(--bs-body-color); margin-left: 120px; font-size: 2rem;" href="#" data-link="/game">
              <span class="d-inline-block py-1">
              <img src="https://static.vecteezy.com/system/resources/previews/028/754/694/non_2x/3d-purple-trophy-cup-winner-champion-icon-for-ui-ux-web-mobile-apps-social-media-ads-designs-png.png" alt="logo_rank" style="width: 50px; height: 50px; margin-right: 10px;">
              RANK
              </span>
            </a>
          </div>
        </div>


      </default-layout-main>
    `;
  }

  
}
customElements.define('view-careers', ViewCareers);
