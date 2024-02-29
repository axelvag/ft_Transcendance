import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';
import { user } from '@/auth.js';

class ViewDash extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <div class="dashboard-content">
          <div class="dashboard-text">
              <h1>TRANSCENDANCE PONG</h1>
          </div>
          <h2>Bienvenue, ${user.username}, ${user.id}</h2>
          <div class="big-button-play">
            <button type="button" class="btn btn-outline-light btn-lg">Play Now</button>
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
