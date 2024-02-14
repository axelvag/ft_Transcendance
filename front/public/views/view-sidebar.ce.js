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
    fetch('http://127.0.0.1:8001/accounts/logout/', {
      method: 'POST',
      credentials: 'include', // Pour envoyer les cookies (sessionid, csrftoken)
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': this.getCSRFToken(), // Assurez-vous d'obtenir le token CSRF correctement
      },
    })
    .then(response => {
      if (!response.ok) throw new Error('Logout failed');
      return response.json(); // Ou gérer autrement selon la réponse attendue
    })
    .then(data => {
      redirectTo("/");
    })
    .catch(error => console.error('Error:', error));
  }
  
  // Fonction pour obtenir le token CSRF depuis le cookie
  getCSRFToken() {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken=')).split('=')[1];
  }
}

customElements.define('view-sidebar', ViewSidebar);
