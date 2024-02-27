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
      </style>


      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center">
          Statistic
        </h1>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-2">
              <img src="https://robohash.org/4572b535a32e02ecef37ebf74c8d76a7?set=set2&bgset=&size=400x400" class="img-thumbnail rounded-circle" width="230" height="230" alt="character">
            </div>
          </div>
          <div class="col-md-6">
            <h1 class="display-5 fw-bold mb-4 text-center text-lg irish-grover">
              ${user.id} / 4
            </h1>
          </div>
        </div>
        <div
        <h3 class="display-5 fw-bold mb-4">
          ${user.username}
        </h3>

      </default-layout-main>
    `;
  }

  
}
customElements.define('view-careers', ViewCareers);
