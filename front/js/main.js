import friends from "./views/friends.js";
import careers from "./views/careers.js";
import profil from "./views/profil.js";
import settings from "./views/settings.js";
import notFound from "./views/notFound.js";

/**
 Create a object Routes
    title: descrive a title of the page
    template: say a application use the name associate of "template"
    '<view-home></view-home>'
 */

const routes = {
    "/": {title: "Profil", template: profil},
    "/friends": {title: "Friends", template: friends}, 
    "/careers": {title: "Careers", template: careers},
    "/settings": {title: "Settings", template: settings},
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
        history.pushState("", "", e.target.href); // allows modify URL in the search bar
        router();
    }
});

// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);