import './views/view-home.js'

import about from "./views/about.js";
import contact from "./views/contact.js";
// import home from "./views/home.js";
import notFound from "./views/notFound.js";

/**
 Create a object Routes
    title: descrive a title of the page
    template: say a application use the name associate of "template"

 */

const routes = {
    "/": {title: "Home", template: '<view-home></view-home>'},
    "/about": {title: "About", template: about}, 
    "/contact": {title: "Contact", template:contact},
    "/not-found": { title: "Not Found", template: notFound },
};

/**
 * location.pathname --> retourne l'URL courante de la page web 
 */
function router(e) {
    
    let view = routes[location.pathname];
    const appEl = document.querySelector("#app");

    if (!appEl) console.error("#app not found");

    if (view){
        document.title = view.title; // modify dynamichte page of title
        console.log("template", view.template);
        appEl.innerHTML = view.template; // update Html from the DOM
    }
    else{
        // history.replaceState("", "", "/");
        // router();
        document.title = routes["/not-found"].title;
        appEl.innerHTML = routes["/not-found"].template;
    }
};

// Handle navigation
document.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);