class ViewGameOnline extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('game-id')) {
      const gameId = this.getAttribute('game-id');
      this.innerHTML = `
        <div class="text-center p-5">
          <h1 class="mb-4">Game online ${gameId}</h1>
          <button class="btn btn-primary" data-link="/">Go home</button>
        </div>
      `;
    } else {
      this.innerHTML = `
        <div class="text-center p-5">
          <h1 class="mb-4">Game online</h1>
          <button class="btn btn-primary" data-link="/game/online/123">Join game</button>
        </div>
      `;
    }
  }
}

customElements.define('view-game-online', ViewGameOnline);
