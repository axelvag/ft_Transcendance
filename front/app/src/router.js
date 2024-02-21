// templates
// import careers from './views/careers.js';
// import settings from './views/settings.js';
import notFound from './views/notFound.js';

// views
import '@/views/view-welcome.ce.js';
import '@/views/view-signup.ce.js';
import '@/views/view-profil.ce.js';
import '@/views/view-email-confirmation.ce.js';
import '@/views/view-login.ce.js';
import '@/game/view-game.ce.js';
import '@/views/view-friend.ce.js';
import '@/views/view-reinitialisation-pass-mail.ce.js';
import '@/views/view-new-pass.ce.js';
import '@/views/view-dashboard.ce.js';
import '@/views/settings.js';
import '@/views/careers.js';

const useHash = true;

const baseUrl = '';

const routes = {
  // logged out routes
  '/': {
    title: 'Pong',
    template: '<view-welcome></view-welcome>',
  },
  '/login': {
    title: 'Login',
    template: '<view-signin></view-signin>',
  },
  '/signup': {
    title: 'Signup',
    template: '<view-signup></view-signup>',
  },
  '/forget-pass': {
    title: 'Forget password',
    template: '<view-forget-pass></view-forget-pass>',
  },
  '/dashboard': {
    title: 'Dashboard',
    template: '<view-dash></view-dash>',
  },
  '/new-pass': {
    title: 'New password',
    template: '<view-new-pass></view-new-pass>',
  },
  '/email-confirmation': {
    title: 'Email confirmation',
    template: '<view-email-confirmation></view-email-confirmation>',
  },
  // logged in routes
  '/profil': {
    title: 'Profil',
    template: '<view-profil></view-profil>',
  },
  '/friends': {
    title: 'Friends',
    template: '<view-friend></view-friend>',
  },
  '/careers': {
    title: 'Careers',
    template: '<view-careers></view-careers>',
  },
  '/settings': {
    title: 'Settings',
    template: '<view-settings></view-settings>',
  },
  '/game': {
    title: 'Game',
    template: '<view-game></view-game>',
  },
  // not found
  '/not-found': {
    title: 'Not Found',
    template: notFound,
  },
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
  const pathname = relativePath.split('?')[0];
  const view = routes[pathname];
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
  const linkEl = e.target.closest('[data-link]');
  if (linkEl) {
    e.preventDefault();
    const path = useHash
      ? // with hash
        '/#' + linkEl.getAttribute('data-link')
      : // without hash
        linkEl.getAttribute('data-link');
    history.pushState('', '', baseUrl + path);
    router();
  }
});

const redirectTo = pathKey => {
  console.log("ici");
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
