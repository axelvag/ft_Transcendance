import '@/components/layouts/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout-main.ce.js';
import { redirectTo } from '@/router.js';

class ViewDash extends HTMLElement {
  connectedCallback() {
    const username = localStorage.getItem('username');
    console.log(username);
    if (!username) {
      alert('errors');
      redirectTo('/');
      return;
    }
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <div class="dashboard-content">
          <div class="dashboard-text">
              <h1>TRANSCENDANCE PONG</h1>
          </div>
          <h2>Bienvenue, ${username}</h2>
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
      this.suppUser(username);
    });
  }
  suppUser(username) {
    const url = `http://127.0.0.1:8001/accounts/delete_user/${username}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // window.user = null;
          localStorage.removeItem('username');
          redirectTo('/');
        }
      })
      .catch(error => console.error('Error:', error));
  }
}

customElements.define('view-dash', ViewDash);
