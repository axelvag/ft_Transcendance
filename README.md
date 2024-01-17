# SPA - Routing-js

```
The term "SPA"
stands for "Single Page Application". It is a 
development concept in which a single HTML page is loaded into the browser
in the browser, and all subsequent interactions with the 
the user take place on that page. Here are the main aspects 
of how SPAs work:
```

## Explain the code main.js

```
My object "view" allow to identify my actually URL, thanks to this "location.pathname" going back URL.

if (view){
    document.title = view.title;
    appEl.innerHTML = view.template;
}

This conditions allows modify title in the navigation and update HTML from the DOM

appEl corresponds to id in my index.html
```

## Handle navigation

```
document.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

"document" represents the all DOM.
"addEventListener" is a method that take two arguments: a type listen event (here, "click") and a fonctions a execute when events is ready 
"e.preventDefault()" cancel the comportement by default
```

## Custom Element

```
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

This startegy Custom Element (Web Components) allows to create our own comportement and style.
    - Encapsulation
    - Reusability
    - and more
And allows to create nested componants
```

-----------------------------------------------------

style.css for surcharge of Bootstrap !
```
.custom-nav {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.sidebar {
    background-color: #252529;
    color: white;
    padding: 1rem;
}

.sidebar h2 {
    margin-bottom: 1rem;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1.2rem;
}

.sidebar .btn-primary {
    background-color: #B558F6;
    border: none;
}

.main-content {
    background-color: #f8f9fa;
    padding: 1rem;
}

button.btn-primary:hover {
    background-color: #B558F6;
    color: white;
    border-color: white;
    border-color: #B558F6 !important;
    font-size: 1rem !important;
}

.sidebar .custom-button-large-text {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1.2rem;
}

.sidebar .logout-large-text {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1rem;
}

#app {
    display: flex;
} 
```

---------------------------------------

Explain Custom Element with Bootstrap

```
Custom Elements 
class ViewSidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="container-fluid h-100">
      
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

Explain
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
```