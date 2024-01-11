class ViewHome extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = `
            <nav class="nav flex-column">
                <a class="nav-link" href="/" data-link>Home</a>
                <a class="nav-link" href="/about" data-link>About</a>
                <a class="nav-link" href="/contact" data-link>Contact</a>
            </nav>
            <main>
                <h1>Home</h1>
                <p>Consectetur in vitae totam nulla reprehenderit est earum debitis quam laboriosam.</p>
            </main>
        `
    }
}

customElements.define('view-home', ViewHome);

//Custom Elements 