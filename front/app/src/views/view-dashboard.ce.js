import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewDash extends HTMLElement {
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
    <default-layout-sidebar></default-layout-sidebar>
    <default-layout-main>
      <div class="row">
        <div class="col-md-6">
          <div class="dashboard-text">
              <h1>TRANSCENDANCE PONG</h1>
          </div>
        </div>
        <div class="col-md-6 d-flex flex-column align-items-center">
          <div class="mb-2">
            <img src="https://pbs.twimg.com/media/E3-FSn5XwAMwOYR.jpg" class="img-thumbnail rounded-circle" width="200" height="200" alt="character">
          </div>
          <div>
            <h3 class="display-5 fw-bold btn-lg">
              ${user.username}
            </h3>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center align-items-center mt-3" style="height: 100vh;">
        <div class="big-button-play rounded-3">
          <button type="button" class="btn btn-outline-light btn-lg" style="width: 400px; height: 180px; font-size: 4rem;">
            Play Now
          </button>
        </div>
      </div>

        
      <div id="supp">
        <a href="#" id="delete-account-link">
          <h3> supprimer le compte</h3>
        </a>
      </div>
    </default-layout-main>
    `;
    this.querySelector('#delete-account-link').addEventListener('click', event => {
      event.preventDefault();
      this.suppUser();
    });
  }

  suppUser() {
    const url = `http://127.0.0.1:8001/accounts/delete_user/${user.username}`;
    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': this.getCSRFToken(),
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          user.isAuthenticated = false;
          redirectTo('/');
        }
      })
      .catch(error => console.error('Error:', error));
  }
  getCSRFToken() {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      .split('=')[1];
  }
}

customElements.define('view-dash', ViewDash);
