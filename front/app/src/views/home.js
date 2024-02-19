// import { redirectTo } from '@/router.js';
// import { user } from '@/auth.js';
import { verifyUserLoginAndDisplayDashboardHome } from '@/auth.js';


class ViewHome extends HTMLElement {
  connectedCallback() {
  //   verifyUserLoginAndDisplayDashboardHome(this.displayDashboard.bind(this));
  //   // const isLoggedIn = isUserLoggedIn();
  //   // if (!isLoggedIn) {
  //   //   redirectTo('/');
  //   // }
  // }

  // displayDashboard() {

    this.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="./css/home_auth.css">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>django auth</title>
    </head>
    <body>
      <div class="navbar">
        <img src="assets/img/logoTranscendencenew.png" alt="Description de l'image" class="img-home">
        <div class="flex">
          <label class="switch">
            <input type="checkbox" id="toggle-example" onchange="toggleTheme()">
            <span class="slider round"></span>
          </label>
            <p class="margin_left"><a data-link="/login" class="play-now-btn">Connexion</a></p>
            <p class="margin_left"><a data-link="/profil" class="play-now-btn">Profil</a></p>
            <p class="margin_left"><a data-link="/signup" class="play-now-btn">Inscription</a></p>
        </div>
      </div>
      <div class="bottom_navbar"></div>
        <div class="padding-global">
          <div class="center-container">
            <h1 class="gradient-text-home">The Pong Game</h1>
            <div class="margin_top"></div>
              <button type="submit" class="play-now-btn_play" data-link="/game">Play Now</button>
          </div>
          <script src="{% static 'js/theme-toggle.js' %}"></script>
        </div>
    </body>
    </html>
    `;
  }
}
customElements.define('view-home', ViewHome);

// export default template;


