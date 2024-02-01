import './view-sidebar.ce.js';
import { redirectTo } from '../router.js';

class ViewDash extends HTMLElement {
  // constructor() {
  //   super();
  //   this.saveProfile = this.saveProfile.bind(this); // Pour l'instance de this et pas avoir de prbl
  //   this.selectedAvatarFile = null;
  // }

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
      event.preventDefault(); // Empêche le lien de suivre son URL par défaut
      this.suppUser(username);
    });
  }
  suppUser(username) {
    const url = `http://127.0.0.1:8000/accounts/delete_user/${username}`;
    fetch(url, { // Assurez-vous que l'URL correspond à votre configuration Django
      method: 'POST', // ou 'POST' selon la méthode attendue par votre backend
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // Ajoutez des en-têtes supplémentaires si nécessaire, comme le CSRF token pour les requêtes POST
      },
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        localStorage.removeItem('username');
        // alert('success');// Affiche un message de confirmation
        redirectTo("/"); // Redirige l'utilisateur vers la page d'accueil
      }
    })
    .catch(error => console.error('Error:', error));
  }
}

customElements.define('view-dash', ViewDash);
