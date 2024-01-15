import friends from "./views/friends.js";
import careers from "./views/careers.js";
import profil from "./views/profil.js";
import settings from "./views/settings.js";
import notFound from "./views/notFound.js";
import logout from "./views/logout.js";

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
    "/logout": { title: "Logout", template: logout },
};

// classList allow manipulate CSS class this element 
function updateActiveNavLink() {
    const links = document.querySelectorAll('.custom-nav a');
    const currentPath = location.pathname;

    let index = 0;
    while (index < links.length)
    {
        const link = links[index];

        console.log("test-->", link.getAttribute('href'));
        if (link.getAttribute('href') === currentPath)
            link.classList.add('active');
        else
            link.classList.remove('active');

        index++;
    }
}

/**
 * location.pathname --> retourne l'URL courante de la page web 
 */
function router(e) {

    let view = routes[location.pathname];
    const appEl = document.querySelector("#app");

    if (!appEl) console.error("#app not found");

    if (view){
        document.title = view.title; // modify dynamichte page of title
        // console.log("template", view.template);
        appEl.innerHTML = view.template; // Modify interior HTML of element 
        updateActiveNavLink();
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
        history.pushState("", "", e.target.href); // allows modify URL in the search bar nothing modify the page
        router();
    }
});

// Update router
window.addEventListener("popstate", router); // When user click in previous or next
window.addEventListener("DOMContentLoaded", router);