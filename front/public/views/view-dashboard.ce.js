import './view-sidebar.ce.js';
import { redirectTo } from '../router.js';

class ViewDash extends HTMLElement {
  connectedCallback() {
    // const username = window.user ? window.user.username : null;
    const username = localStorage.getItem('username');
    console.log(username);
    if(!username){
      alert('errors');
      redirectTo("/");
      return;
    }
    this.innerHTML = `
      <style>
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        
        .play-now-btn {
          background-color: black; /* Couleur de fond */
          color: white; /* Couleur du texte */
          padding: 10px 20px; /* Espacement interne */
          border: 2px solid white; /* Bordure blanche*/
          border-radius: 5px; /* Coins arrondis */
          font-size: 16px; /* Taille de la police */
          font-weight: bold; /* Police en gras */
          text-transform: uppercase; /* Texte en majuscules */
          cursor: pointer; /* Curseur en forme de pointeur */
          transition: background-color 0.3s, color 0.3s; /* Animation de transition */
          text-decoration: none; /* Aucune décoration de texte */
          display: inline-block; /*Permet au bouton de ne prendre que l'espace nécessaire */
          margin-top: 1rem;
        }
        
        .white-mode .play-now-btn {
          background-color: rgb(255, 255, 255); /* Couleur de fond */
          color: rgb(0, 0, 0); /* Couleur du texte */
          border: 2px solid rgb(0, 0, 0); /* Bordure blanche*/
        }
        
        .play-now-btn:hover, .play-now-btn:focus {
          background-color: white; /* Couleur de fond lors du survol */
          color: black; /* Couleur du texte lors du survol */
          text-decoration: none; /* Aucune décoration de texte lors du survol */
        }
        
        .white-mode .play-now-btn:hover, .play-now-btn:focus {
          background-color: rgb(0, 0, 0); /* Couleur de fond lors du survol */
          color: rgb(255, 255, 255); /* Couleur du texte lors du survol */
        }
      </style>
      <div class="layout">
        <view-sidebar class="layout-sidebar"></view-sidebar>
        <div class="dashboard-content">
          <h1>Bienvenue, ${username} |</h1>
          <button type="submit" class="play-now-btn_play">Play Now</button>
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
    const url = `http://127.0.0.1:8001/accounts/delete_user/${username}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        // window.user = null;
        localStorage.removeItem('username');
        redirectTo("/");
      }
    })
    .catch(error => console.error('Error:', error));
  }
}

customElements.define('view-dash', ViewDash);
