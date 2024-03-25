import { redirectTo } from '@/router.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewRank extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center mt-md-n5 mt-0">
          <img src="assets/img/rank-icon.png" alt="logo_rank" style="width: 70px; height: 80px; margin-right: 10px;">
          Rank
        </h1>

        <div class="table-responsive">
          <table class="table table-striped table-dark">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Avatar</th>
                <th scope="col">Name</th>
                <th scope="col">Victories</th>
              </tr>
            </thead>
            <tbody>

              <!-- ma boucle de génération de lignes de tableau -->
              <tbody id="table-body">

              <!-- Exemple -->
              <tr>
                <th scope="row">1</th>
                <td><img src="assets/img/avatar-urien.jpg" width="30" height="30" alt="character"></td>
                <td>Davfront</td>
                <td>115151531145351</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td><img src="assets/img/avatar-careers.jpg" width="30" height="30" alt="character"></td>
                <td>Axel</td>
                <td>46156</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td><img src="assets/img/avatar-ken.jpg" width="30" height="30" alt="character"></td>
                <td>Lucas</td>
                <td>3021</td>
              </tr>
              <tr>
                <th scope="row">4</th>
                <td><img src="assets/img/avatar-gill.jpg" width="30" height="30" alt="character"></td>
                <td>Alessio</td>
                <td>1254</td>
              </tr>
              <tr>
                <th scope="row">5</th>
                <td><img src="assets/img/avatar-elena.jpg" width="30" height="30" alt="character"></td>
                <td>the Bird</td>
                <td>399</td>
              </tr>

            </tbody>
          </table>
        </div>

      </default-layout-main>
    `;

    // Récupérer la référence du tbody
    const tbody = document.getElementById('table-body');

    // Boucle pour générer les lignes de la table
    for (let i = 0; i < user.nbtotal; i++) {
      let myusernamebicolor = `<td>${user.username}</td>`; // Par défaut, la balise td pour le nom d'utilisateur
      if (i === 0)
      {
        myusernamebicolor = `<td class="text-bicolor">${user.username}</td>`; // Si i est égal à 0, ajoute la classe text-bicolor
      }

      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <th scope="row">${i + 1}</th>
          <td><img src="assets/img/avatar_careers.jpg" width="30" height="30" alt="character"></td>
          ${myusernamebicolor}
          <td>${user.victories}</td>
        </tr>
      `);
      }
  }
  
}
customElements.define('view-rank', ViewRank);
