class ViewSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar">

        <img src="front/asset/pong-logo.png" alt="Logo" class="logo">
        <button class="start-game">Start a Game</button>

        <nav class="custom-nav">
          <a class="nav-item active" href="/" data-link><i class="bi bi-person"></i> Profile</a>
          <a class="nav-item" href="/friends" data-link><i class="bi bi-people"></i> Friends</a>
          <a class="nav-item" href="/careers" data-link><i class="bi bi-briefcase"></i> Careers</a>
          <a class="nav-item" href="/settings" data-link><i class="bi bi-gear"></i> Settings</a>
        </nav>

        <a class="logout" href="/logout" data-link><i class="bi bi-box-arrow-right"></i> Logout</a>
      </div>
    `;
  }
}

customElements.define('view-sidebar', ViewSidebar);

