import { redirectTo } from '../router.js';

class ViewSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar">
        <a href="#" data-link="/dashboard">
          <img src="./assets/img/pong-logo.png" alt="Logo" class="logo">
        </a>
        <button class="start-game" data-link="/game">Start a Game</button>

        <nav class="custom-nav">
          <a class="nav-item" data-link="/dashboard">
            <ui-icon name="dashboard"></ui-icon>
            Home
          </a>
          <a class="nav-item active" data-link="/profil">
            <ui-icon name="home"></ui-icon>
            Profile
          </a>
          <a class="nav-item" data-link="/friends">
            <ui-icon name="friends"></ui-icon> 
            Friends
          </a>
          <a class="nav-item" data-link="/careers">
            <ui-icon name="carrers"></ui-icon> 
            Careers
          </a>
          <a class="nav-item" data-link="/settings">
            <ui-icon name="settings"></ui-icon>
            Settings
          </a>
        </nav>

        <a class="logout" href="#" data-link="/">
          <ui-icon name="logout"></ui-icon> 
          Log out
        </a>
      </div>
    `;
    this.querySelector('.logout').addEventListener('click', (event) => {
      event.preventDefault(); // Empêche le lien de suivre son URL par défaut
      this.logoutUser();
    });

    this.querySelector('a[data-link="/dashboard"]').addEventListener('click', function(e) {
      e.preventDefault();
      redirectTo('/dashboard');
    });
  }

  logoutUser() {
    fetch('http://127.0.0.1:8001/accounts/logout/', { // Assurez-vous que l'URL correspond à votre configuration Django
      method: 'GET', // ou 'POST' selon la méthode attendue par votre backend
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // Ajoutez des en-têtes supplémentaires si nécessaire, comme le CSRF token pour les requêtes POST
      },
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        // alert(data.message); // Affiche un message de confirmation
        redirectTo("/"); // Redirige l'utilisateur vers la page d'accueil
      }
    })
    .catch(error => console.error('Error:', error));
  }
}

customElements.define('view-sidebar', ViewSidebar);
