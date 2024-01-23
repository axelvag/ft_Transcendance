class ViewSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar">

        <img src="asset/pong-logo.png" alt="Logo" class="logo">
        <button class="start-game" data-link="/game">Start a Game</button>

        <nav class="custom-nav">
          <a class="nav-item active" data-link="/profil"><i class="bi bi-person"></i> Profile</a>
          <a class="nav-item" data-link="/friends"><i class="bi bi-people"></i> Friends</a>
          <a class="nav-item" data-link="/careers"><i class="bi bi-briefcase"></i> Careers</a>
          <a class="nav-item" data-link="/settings"><i class="bi bi-gear"></i> Settings</a>
        </nav>

        <a class="logout" data-link="/logout"><i class="bi bi-box-arrow-right"></i> Logout</a>
      </div>
    `;
  }
}

customElements.define('view-sidebar', ViewSidebar);
