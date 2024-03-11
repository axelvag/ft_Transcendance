# location.pathname (Doc French explain)

    Définition : window.location.pathname renvoie la partie du chemin de l'URL qui suit le nom de domaine. Par exemple, dans l'URL http://www.exemple.com/chemin/page, window.location.pathname renverrait /chemin/page.

    Utilisation dans le Routage : pathname est utilisé pour le routage côté serveur dans les applications web traditionnelles. Chaque chemin différent dans l'URL (comme /chemin/page) correspond généralement à une ressource différente sur le serveur, comme une page HTML distincte.

    Chargement de Page : Lorsque pathname change (par exemple, en cliquant sur un lien standard), le navigateur envoie une nouvelle requête au serveur pour obtenir le contenu de cette nouvelle URL. Cela entraîne le rechargement complet de la page.

# window.location.hash

    Définition : window.location.hash renvoie la partie de l'URL qui suit le symbole dièse (#). Par exemple, dans l'URL http://www.exemple.com/#/chemin, window.location.hash renverrait #/chemin.

    Utilisation dans le Routage : hash est souvent utilisé pour le routage côté client dans les SPA. Le changement du hash ne provoque pas de requête au serveur pour une nouvelle page ; au lieu de cela, il est utilisé par le JavaScript côté client pour afficher dynamiquement un contenu différent sans recharger la page.

    Événements dans le Navigateur : Le changement du hash déclenche l'événement hashchange dans le navigateur, que vous pouvez écouter en JavaScript. Cela permet de mettre à jour la vue affichée à l'utilisateur sans envoyer de requête supplémentaire au serveur.

# Add a route for integrate a page

```
const routes = {
  '/': { title: 'Profil', template: profil },
  '/friends': { title: 'Friends', template: friends },
  '/careers': { title: 'Careers', template: careers },
  '/settings': { title: 'Settings', template: settings },
  '/not-found': { title: 'Not Found', template: notFound },
  '/game': { title: 'Game', template: '<view-game></view-game>' },
  '/logout': { title: 'Logout', template: logout },
  '/rank': { title: 'Rank', template: rank },
};
```

Modify directly in the view folder, your page js.