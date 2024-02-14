import logoSvg from '@/assets/img/logo.svg?raw';
import { toggleTheme } from '@/theme.js';

class ViewWelcome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .viewWelcome-bg {
          position: fixed;
          z-index: -1;
          top: 0;
          left: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 50vh;
          width: 50vw;
          border-radius: 50%;
          background-image: linear-gradient(to right, var(--bs-primary) 0%, var(--bs-secondary) 100%);
          filter: blur(100vmax);
          opacity: 0.75;
        }
      </style>

      <nav class="navbar navbar-expand-lg fixed-top z-2">
        <div class="container-fluid">
          <a class="navbar-brand d-flex" href="#" data-link="/">
            ${logoSvg}
          </a>
          <button class="navbar-toggler border-0 p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas" aria-controls="offcanvas">
            <ui-icon name="menu" class="fs-3"></ui-icon>
          </button>
          <div class="offcanvas offcanvas-end border-0" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasLabel">MENU</h5>
              <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-2">
                <li class="nav-item mx-lg-2">
                  <a class="nav-link" href="#" data-link="/login">Log in</a>
                </li>
                <li class="nav-item mx-lg-2">
                  <a class="nav-link" href="#" data-link="/signup">Sign up</a>
                </li>
                <li class="nav-item mx-lg-2 py-2 py-lg-1 col-12 col-lg-auto">
                  <div class="navbar-text p-0 vr d-none d-lg-flex h-100 y-2 mx-2"></div>
                  <hr class="navbar-text p-0 d-lg-none my-2">
                </li>
                <li class="nav-item mx-lg-2">
                  <a class="nav-link p-0 theme-toggle" href="#">
                    <span class="fs-4">
                      <ui-icon name="moon" class="dark-visible"></ui-icon>
                      <ui-icon name="sun" class="dark-hidden"></ui-icon>
                    </span>
                    <span class="ms-2 d-lg-none">Toggle theme</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      
      <div class="viewWelcome-bg"></div>

      <section class="min-vh-100 d-flex align-items-center pt-5">
        <div class="container text-center">
          <h1 class="display-2 fw-bold mb-4">
            Ultimate <span class="text-gradient">Pong</span> Game 
          </h1>
          <p class="fs-3 fw-semibold mb-4">
            Engage in the classic battle with friends or solo, online and offline.
          </p>
          <p class="py-3">
            <a class="btn btn-primary px-sm-5 py-sm-3 fw-bold" href="#" data-link="/game">
              Play now
            </a>
          </p>
        </div>
      </section>
    `;

    this.querySelector('.theme-toggle')?.addEventListener('click', e => {
      e.preventDefault();
      toggleTheme();
    });
  }
}

customElements.define('view-welcome', ViewWelcome);
