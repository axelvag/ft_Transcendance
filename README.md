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