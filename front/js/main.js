import friends from "./views/friends.js";
import careers from "./views/careers.js";
import profil from "./views/profil.js";
import settings from "./views/settings.js";
import notFound from "./views/notFound.js";
import logout from "./views/logout.js";

const routes = {
    "/": {title: "Profil", template: profil},
    "/friends": {title: "Friends", template: friends}, 
    "/careers": {title: "Careers", template: careers},
    "/settings": {title: "Settings", template: settings},
    "/not-found": { title: "Not Found", template: notFound },
    "/logout": { title: "Logout", template: logout },
};

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

function router(e) {

    let view = routes[location.pathname];
    const appEl = document.querySelector("#app");

    if (!appEl) console.error("#app not found");

    if (view){
        document.title = view.title;
        appEl.innerHTML = view.template;
        updateActiveNavLink();
    }
    else{
        document.title = routes["/not-found"].title;
        appEl.innerHTML = routes["/not-found"].template;
    }
};

document.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);