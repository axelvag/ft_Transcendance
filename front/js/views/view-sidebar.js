class ViewSidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="widthMax container-fluid h-100">
      
          <div class="row h-100">
      
            <!-- Sidebar -->
            <div class="col-md-6 p-4 sidebar vh-100 d-flex flex-column">
      
              <!-- LOGO could be an image or text -->
              <img src="front/asset/pong-logo.png" alt="Logo" class="mb-4" style="max-width: 100%; height: auto;">
      
              <button class="btn btn-outline-light w-100 mb-4 violet-border custom-button-large-text">Start a Game</button>
      
              <!-- Navigation links -->
              <nav class="nav flex-column custom-nav flex-grow-1">
                <a class="nav-link active" href="/" data-link><i class="bi bi-person"></i> Profile</a>
                <a class="nav-link" href="/friends" data-link><i class="bi bi-people"></i> Friends</a>
                <a class="nav-link" href="/careers" data-link><i class="bi bi-briefcase"></i> Careers</a>
                <a class="nav-link" href="/settings" data-link><i class="bi bi-gear"></i> Settings</a>
              </nav>
                
              <a class="nav-link logout-large-text" href="/logout" data-link><i class="bi bi-box-arrow-right"></i> Logout</a>
            </div>
          </div>
        </div>
      `;
    }
}

customElements.define('view-sidebar', ViewSidebar);

// //Custom Elements 

//Explain
{/* <container-fluid h-100>       <-- Prend la hauteur complète de son parent (souvent <body>)
  <row h-100>                 <-- Prend la hauteur complète de son parent (container-fluid)
    <col-md-2 vh-100>         <-- Prend la hauteur complète du viewport, s'étendant sur toute la hauteur de l'écran
      <!-- Sidebar content -->
    </col-md-2>
    <col-md-10>               <-- Prend le reste de l'espace dans la row
      <!-- Main content -->
    </col-md-10>
  </row>
</container-fluid> */}