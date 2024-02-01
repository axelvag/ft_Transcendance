import './view-sidebar.ce.js';
import { redirectTo } from '../router.js';

class ViewDash extends HTMLElement {
  connectedCallback() {
    const username = localStorage.getItem('username');
    if(!username){
      redirectTo("/");
      return;
    }
    console.log(username);
    this.innerHTML = `
      <div class="layout">
        <view-sidebar class="layout-sidebar"></view-sidebar>
        <div class="dashboard-content">
          <h1>Bienvenue, ${username} |</h1>
        </div>
        <div id="supp">
          <a href="#" id="delete-account-link">
            <h1> supprimer le compte</h1>
          </a>
        </div>
      </div>
    `;
    this.querySelector('#delete-account-link').addEventListener('click', (event) => {
      event.preventDefault();
      this.suppUser(username);
    });
  }
  suppUser(username) {
    const url = `http://127.0.0.1:8000/accounts/delete_user/${username}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        localStorage.removeItem('username');
        redirectTo("/");
      }
    })
    .catch(error => console.error('Error:', error));
  }
}

customElements.define('view-dash', ViewDash);
