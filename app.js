function navigate() {
    const path = window.location.pathname;
    const app = document.getElementById('app');
    console.log("Chargement de la page:", path);
    switch (path) {
        case '/':
            app.innerHTML = '<h1>Accueil</h1>';
            break;
        case '/page1':
            app.innerHTML = '<h1>Page 1</h1>';
            break;
        case '/page2':
            app.innerHTML = '<h1>Page 2</h1>';
            break;
        default:
            app.innerHTML = '<h1>404 - Page non trouvée</h1>';
    }
}

window.onpopstate = navigate;
navigate();

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        history.pushState(null, '', e.target.href);
        navigate();
    }
});
