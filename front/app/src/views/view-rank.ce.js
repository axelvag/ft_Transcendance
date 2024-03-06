import { redirectTo } from '@/router.js';
import '@/components/layouts/default-layout/default-layout-sidebar.ce.js';
import '@/components/layouts/default-layout/default-layout-main.ce.js';
import { user, isAuthenticated } from '@/auth.js';

class ViewRank extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <default-layout-sidebar></default-layout-sidebar>
      <default-layout-main>
        <h1 class="display-5 fw-bold mb-4 text-center" style="margin-top: -50px;">
          <img src="https://static.vecteezy.com/system/resources/previews/028/754/694/non_2x/3d-purple-trophy-cup-winner-champion-icon-for-ui-ux-web-mobile-apps-social-media-ads-designs-png.png" alt="logo_rank" style="width: 50px; height: 50px; margin-right: 10px;">
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
                <td><img src="https://www.exobaston.com/wp-content/uploads/2023/01/Meta-Knight-personnage-SSBU-1.jpg" width="30" height="30" alt="character"></td>
                <td>Davfront</td>
                <td>115151531145351</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td><img src="https://pbs.twimg.com/media/E3-FSn5XwAMwOYR.jpg" width="30" height="30" alt="character"></td>
                <td>Axel</td>
                <td>46156</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td><img src="https://cdn.gamekult.com/images/gallery/34/342893/the-legend-of-zelda-link-s-awakening-switch-4e108cad.jpg" width="30" height="30" alt="character"></td>
                <td>Lucas</td>
                <td>3021</td>
              </tr>
              <tr>
                <th scope="row">4</th>
                <td><img src="https://i.pinimg.com/736x/c9/d3/b1/c9d3b164c7d010b4ed2c516e30d5c607.jpg" width="30" height="30" alt="character"></td>
                <td>Alessio</td>
                <td>1254</td>
              </tr>
              <tr>
                <th scope="row">5</th>
                <td><img src="https://preview.redd.it/should-heihachi-mishima-ever-return-as-a-hidden-character-v0-dc586neuiawa1.jpg?width=640&crop=smart&auto=webp&s=be83f31083bcc91c73f20ae6bbd83a0c277e6502" width="30" height="30" alt="character"></td>
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
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <th scope="row">${i + 1}</th>
          <td><img src="https://i.pravatar.cc/300?u=6${user.id}" width="30" height="30" alt="character"></td>
          <td>${user.username}</td>
          <td>${user.victories}</td>
        </tr>
      `);
      }
  }
  
}
customElements.define('view-rank', ViewRank);
