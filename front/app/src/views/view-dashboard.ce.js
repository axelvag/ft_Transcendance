import './view-sidebar.ce.js';
import { redirectTo } from '@/router.js';
import { verifyUserLoginAndDisplayDashboard } from '@/auth.js';
import { user } from '@/auth.js';
import { isAuthenticated } from '@/auth.js';

class ViewDash extends HTMLElement {
  connectedCallback() {
    // verifyUserLoginAndDisplayDashboard(this.displayDashboard.bind(this));
    const isAuth = isAuthenticated();
    if (!isAuth) {
      redirectTo('/login');
    } else {
      this.displayDashboard();
    }
  }

  displayDashboard() {
    this.innerHTML = `
      <style>
        .dashboard-text {
          margin-left: 300px;
          text-align: center;
          margin-top: 100px; /* Ajustez la valeur selon vos besoins */
          font-size: 72px;
        }
        

        #supp {
          position: absolute;
          bottom: 0;
          right: 0;
          margin: 20px; /* Ajoutez une marge pour éviter que le texte ne soit collé aux bords */
        }

        .big-button-play {
          display: flex;
          justify-content: center; /* Centrer horizontalement */
          align-items: center; /* Centrer verticalement */
          margin-bottom: 300px; /* Ajustez la valeur selon vos besoins */
          margin-left: 100px;
          height: 100vh; /* Pour occuper toute la hauteur de la fenêtre */
        }
      
        .play-now-btn_play {
          font-size: 36px; /* Taille de police très grande */
        } 

        .custom-btn {
          font-size: 48px; /* Augmenter la taille de la police */
          padding: 20px 40px; /* Augmenter le rembourrage pour agrandir la zone cliquable */
        }
      </style>
      <div class="layout">
        <view-sidebar class="layout-sidebar"></view-sidebar>
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
      </div>
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
