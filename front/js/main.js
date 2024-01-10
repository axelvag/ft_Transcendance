/**
 Create a object Routes
    title: descrive a title of the page
    render: say a application use the name associate of "render"

 */

const routes = {
    "/": {title: "Home", render: home}, 
    "/about": {title: "About", render: about}, 
    "/contact": {title: Conatct, render:conatct},
    "/not-found": { title: "Not Found", render: notFound },
};

/**
 * location.pathname --> retourne l'URL courante de la page web 
 */
function router(){
    let view = routes[locations.pathname];

    if (view){
        document.title = view.title; // modify dynamichte page of title
        app.innerHTML = view.render(); // update Html from the DOM
    }
    else{
        // history.replaceState("", "", "/");
        // router();
        document.title = routes["/not-found"].title;
        app.innerHTML = routes["/not-found"].render();
    }
};