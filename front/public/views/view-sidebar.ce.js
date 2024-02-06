class ViewSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar">

        <img src="assets/img/pong-logo.png" alt="Logo" class="logo">
        <button class="start-game" data-link="/game">Start a Game</button>

        <nav class="custom-nav">
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
  }
}

customElements.define('view-sidebar', ViewSidebar);
