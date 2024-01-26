// templates
import login from './views/login.js';
import friends from './views/friends.js';
import careers from './views/careers.js';
import settings from './views/settings.js';
import notFound from './views/notFound.js';
import home from './views/home.js';

const useHash = true;

const baseUrl = '/front/public';

const routes = {
  '/': { title: 'Home', template: home },
  '/profil': { title: 'Profil', template: '<view-profil></view-profil>' },
  // public
  '/login': { title: 'Login', template: login },
  '/signup': { title: 'Login', template: '<view-signup></view-signup>' },
  // logged
  '/friends': { title: 'Friends', template: friends },
  '/careers': { title: 'Careers', template: careers },
  '/settings': { title: 'Settings', template: settings },
  '/game': { title: 'Game', template: '<view-game></view-game>' },
  // not found
  '/not-found': { title: 'Not Found', template: notFound },
};

const updateActiveNavLink = () => {
  const links = document.querySelectorAll('[data-link]');
  const currentPath = useHash
    ? // with hash
      location.hash.replace('#', '') || '/'
    : // without hash
      location.pathname.substring(baseUrl.length);

  let index = 0;
  while (index < links.length) {
    const link = links[index];

    if (link.getAttribute('data-link') === currentPath) link.classList.add('active');
    else link.classList.remove('active');

    index++;
  }
};

const router = () => {
  const relativePath = useHash
    ? // with hash
      (window.location.hash || '#/').substring(1)
    : // without hash
      location.pathname.substring(baseUrl.length);
  const view = routes[relativePath];
  const appEl = document.querySelector('#app');

  if (!appEl) console.error('#app not found');

  if (view) {
    document.title = view.title;
    appEl.innerHTML = view.template;
    updateActiveNavLink();
  } else {
    document.title = routes['/not-found'].title;
    appEl.innerHTML = routes['/not-found'].template;
  }
};

document.addEventListener('click', e => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    const path = useHash
      ? // with hash
        '/#' + e.target.getAttribute('data-link')
      : // without hash
        e.target.getAttribute('data-link');
    history.pushState('', '', baseUrl + path);
    router();
  }
});

const redirectTo = pathKey => {
  const path = useHash
    ? // with hash
      '/#' + pathKey
    : // without hash
      pathKey;
  history.pushState('', '', baseUrl + path);
  router();
};

window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router);
// Écouteur d'événements pour les changements de hash
window.addEventListener('hashchange', router);

export { redirectTo };
