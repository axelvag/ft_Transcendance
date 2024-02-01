import './view-sidebar.ce.js';

class ViewDash extends HTMLElement {
  // constructor() {
  //   super();
  //   this.saveProfile = this.saveProfile.bind(this); // Pour l'instance de this et pas avoir de prbl
  //   this.selectedAvatarFile = null;
  // }

  connectedCallback() {
    const username = localStorage.getItem('username');
    console.log(username);
    this.innerHTML = `
      <div class="layout">
        <view-sidebar class="layout-sidebar"></view-sidebar>
        <div class="dashboard-content">
            <h1>Bienvenue, ${username}</h1>
        </div>
      </div>
    `;
  }
}

customElements.define('view-dash', ViewDash);
