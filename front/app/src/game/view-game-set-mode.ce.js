class ViewGameSetMode extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="min-vh-100 halo-bicolor d-flex flex-column p-2">
        <div class="d-flex">
          <a href="#" data-link="/" class="d-inline-block link-body-emphasis link-opacity-75 link-opacity-100-hover fs-4 m-3" title="back">
            <ui-icon name="arrow-up" rotate="-90" class="me-2"></ui-icon>
          </a>
        </div>
        <div class="flex-shrink-0 container-fluid my-auto" style="max-width: 60rem;">
          <h1 class="fw-bold text-center mb-5">Choose a Game Mode</h1>

          <!-- if not logged in -->
          <div class="alert alert-warning text-center mb-4" role="alert">
            <div class="d-flex gap-2 align-items-center">
              <div class="flex-shrink-1">
                <ui-icon name="error" scale="1.25" class="me-2"></ui-icon>
                <span class="fw-bold">You need to be logged in to access the online modes.</span>
              </div>
              <div class="flex-shrink-0 ms-auto d-flex justify-content-center gap-3">
                <a href="#" data-link="/login" class="btn btn-warning btn-sm fw-semibold">Log in</a>
                <a href="#" data-link="/signup" class="btn btn-warning btn-sm fw-semibold">Sign up</a>
              </div>
            </div>
          </div>
          
          <!-- Select mode -->
          <div class="row g-4 text-center">
            
            <!-- Solo -->
            <div class="col-12 col-sm-6 col-md-3">
              <div class="card card-hoverable overflow-hidden flex-row flex-md-column">
                <div class="h2 bg-bicolor-diagonal m-0 p-3 flex-shrink-0">
                  <ui-icon name="user" scale="2.5" class="text-black opacity-75"></ui-icon>
                </div>
                <div class="card-body d-flex flex-column justify-content-center">
                  <h5 class="card-title fw-bold text-bicolor">Solo</h5>
                  <p class="card-text opacity-50">Human vs AI</p>
                </div>
              </div>
            </div>

            <!-- Duo -->
            <div class="col-12 col-sm-6 col-md-3">
              <a href="#" data-link="/game/offline-duo" class="card card-hoverable overflow-hidden flex-row flex-md-column">
                <div class="h2 bg-bicolor-diagonal m-0 p-3 flex-shrink-0">
                  <ui-icon name="users" scale="2.5" class="text-black opacity-75" style="transform: scale(1.2);"></ui-icon>
                </div>
                <div class="card-body d-flex flex-column justify-content-center">
                  <h5 class="card-title fw-bold text-bicolor">Duo</h5>
                  <p class="card-text opacity-50">1v1 offline</p>
                </div>
              </a>
            </div>

            <!-- Online -->
            <div class="col-12 col-sm-6 col-md-3">
              <div class="card card-hoverable overflow-hidden flex-row flex-md-column" disabled>
                <div class="h2 bg-bicolor-diagonal m-0 p-3 flex-shrink-0">
                  <ui-icon name="globe-users" scale="2.5" class="text-black opacity-75"></ui-icon>
                </div>
                <div class="card-body d-flex flex-column justify-content-center">
                  <h5 class="card-title fw-bold text-bicolor">Online</h5>
                  <p class="card-text opacity-50">1v1 online</p>
                </div>
              </div>
            </div>

            <!-- Tournament -->
            <div class="col-12 col-sm-6 col-md-3">
              <div class="card card-hoverable overflow-hidden flex-row flex-md-column" disabled>
                <div class="h2 bg-bicolor-diagonal m-0 p-3 flex-shrink-0">
                  <ui-icon name="tournament" scale="2.5" class="text-black opacity-75"></ui-icon>
                </div>
                <div class="card-body d-flex flex-column justify-content-center">
                  <h5 class="card-title fw-bold text-bicolor">Tournament</h5>
                  <p class="card-text opacity-50">Multiplayer online</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        <div class="flex-shrink-0 py-4 mb-2"></div>
      </div>
    `;
  }
}
customElements.define('view-game-set-mode', ViewGameSetMode);
