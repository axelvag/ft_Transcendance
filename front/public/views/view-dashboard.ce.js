import './view-sidebar.ce.js';
import { redirectTo } from '../router.js';

// class ViewDash extends HTMLElement {
//   connectedCallback() {
//     // const username = window.user ? window.user.username : null;
//     const username = localStorage.getItem('username');
//     console.log(username);
//     if(!username){
//       alert('errors');
//       redirectTo("/");
//       return;
//     }
//     this.innerHTML = `
//       <div class="layout">
//         <view-sidebar class="layout-sidebar"></view-sidebar>
//         <div class="dashboard-content">
//           <h1>Bienvenue, ${username} |</h1>
//         </div>
//         <div id="supp">
//           <a href="#" id="delete-account-link">
//             <h1> supprimer le compte</h1>
//           </a>
//         </div>
//       </div>
//     `;
//     this.querySelector('#delete-account-link').addEventListener('click', (event) => {
//       event.preventDefault();
//       this.suppUser(username);
//     });
//   }
//   suppUser(username) {
//     const url = `http://127.0.0.1:8001/accounts/delete_user/${username}`;
//     fetch(url, {
//       method: 'POST',
//       headers: {
//         'X-Requested-With': 'XMLHttpRequest',
//       },
//     })
//     .then(response => response.json())
//     .then(data => {
//       if(data.success) {
//         // window.user = null;
//         localStorage.removeItem('username');
//         redirectTo("/");
//       }
//     })
//     .catch(error => console.error('Error:', error));
//   }
// }

// customElements.define('view-dash', ViewDash);


class ViewDash extends HTMLElement {
  connectedCallback() {
    this.verifyUserLoggedIn();
  }

  verifyUserLoggedIn() {
    // URL de la vue Django pour vérifier si l'utilisateur est connecté
    const url = 'http://127.0.0.1:8001/accounts/is_user_logged_in/';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.is_logged_in) {
          // L'utilisateur est connecté, utiliser les données reçues
          const username = data.username;
          // Afficher le contenu du tableau de bord avec le nom d'utilisateur
          this.displayDashboard(username);
        } else {
          // L'utilisateur n'est pas connecté, rediriger vers la page de connexion
          alert('Veuillez vous connecter.');
          redirectTo("/");
        }
      })
      .catch(error => {
        console.error('Erreur lors de la vérification de l\'état de connexion:', error);
      });
  }

  displayDashboard(username) {
    this.innerHTML = `
      <div class="layout">
        <view-sidebar class="layout-sidebar"></view-sidebar>
        <div class="dashboard-content">
          <h1>Bienvenue, ${username}</h1>
        </div>
        <div id="supp">
          <a href="#" id="delete-account-link">
            <h1>Supprimer le compte</h1>
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
    // Le reste de votre méthode suppUser reste inchangé
  }
}

customElements.define('view-dash', ViewDash);