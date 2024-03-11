import { isAuthenticated } from '@/auth.js';

import '@/views/view-not-found.ce.js';
import '@/views/view-welcome.ce.js';
import '@/views/view-signup.ce.js';
import '@/views/view-profile.ce.js';
import '@/views/view-email-confirmation.ce.js';
import '@/views/view-login.ce.js';
import '@/game/view-game-set-mode.ce.js';
import '@/game/view-game-offline.ce.js';
import '@/views/view-friend.ce.js';
import '@/views/view-reinitialisation-pass-mail.ce.js';
import '@/views/view-new-pass.ce.js';
import '@/views/view-dashboard.ce.js';
import '@/views/view-settings.ce.js';
import '@/views/view-careers.ce.js';
import '@/views/view-rank.ce.js';
import '@/views/view-loading.ce.js';

const useHash = true;

const baseUrl = '';

const isLoggedOutGuard = async () => {
  const isLoggedin = await isAuthenticated();
  if (isLoggedin) redirectTo('/dashboard');
  return !isLoggedin;
};

const isLoggedInGuard = async () => {
  const isLoggedin = await isAuthenticated();
  if (!isLoggedin) redirectTo('/login');
  return isLoggedin;
};

const routes = {
  '/': {
    title: 'Pong',
    template: '<view-welcome></view-welcome>',
  },
  // auth routes
  '/login': {
    title: 'Login',
    template: '<view-signin></view-signin>',
    beforeEnter: isLoggedOutGuard,
  },
  '/signup': {
    title: 'Signup',
    template: '<view-signup></view-signup>',
    beforeEnter: isLoggedOutGuard,
  },
  '/forget-pass': {
    title: 'Forget password',
    template: '<view-forget-pass></view-forget-pass>',
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
  '/dashboard': {
    title: 'Dashboard',
    template: '<view-dash></view-dash>',
    beforeEnter: isLoggedInGuard,
  },
  '/profile': {
    title: 'Profile',
    template: '<view-profile></view-profile>',
    beforeEnter: isLoggedInGuard,
  },
  '/friends': {
    title: 'Friends',
    template: '<view-friend></view-friend>',
    beforeEnter: isLoggedInGuard,
  },
  '/careers': {
    title: 'Careers',
    template: '<view-careers></view-careers>',
    beforeEnter: isLoggedInGuard,
  },
  '/settings': {
    title: 'Settings',
    template: '<view-settings></view-settings>',
    beforeEnter: isLoggedInGuard,
  },
  '/game': {
    title: 'Game',
    template: '<view-game-set-mode></view-game-set-mode>',
  },
  '/game/solo': {
    title: 'Game',
    template: '<view-game-offline></view-game-offline>',
  },
  '/game/duo': {
    title: 'Game',
    template: '<view-game-offline duo></view-game-offline>',
  },
  // not found
  '/not-found': {
    title: 'Not Found',
    template: '<view-not-found></view-not-found>',
  },
  '/rank': {
    title: 'Rank',
    template: '<view-rank></view-rank>',
    beforeEnter: isLoggedInGuard,
  },
  '/loading': {
    title: 'Loading',
    template: '<view-loading></view-loading>',
    beforeEnter: isLoggedInGuard,
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

const router = async () => {
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
    if (view.beforeEnter) {
      const canEnterRoute = await view.beforeEnter();
      if (!canEnterRoute) return;
    }
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
