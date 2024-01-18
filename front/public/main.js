// components
import './components/icons/ui-icon.ce.js';

// views
import './game/view-game.ce.js';

// templates
import friends from './views/friends.js';
import careers from './views/careers.js';
import profil from './views/profil.js';
import settings from './views/settings.js';
import notFound from './views/notFound.js';
import logout from './views/logout.js';

const baseUrl = '/front/public';

const routes = {
  '/': { title: 'Profil', template: profil },
  '/friends': { title: 'Friends', template: friends },
  '/careers': { title: 'Careers', template: careers },
  '/settings': { title: 'Settings', template: settings },
  '/not-found': { title: 'Not Found', template: notFound },
  '/game': { title: 'Game', template: '<view-game></view-game>' },
  '/logout': { title: 'Logout', template: logout },
};

function updateActiveNavLink() {
  const links = document.querySelectorAll('.custom-nav a');
  const currentPath = location.pathname.substring(baseUrl.length);

  let index = 0;
  while (index < links.length) {
    const link = links[index];

    if (link.getAttribute('data-link') === currentPath) link.classList.add('active');
    else link.classList.remove('active');

    index++;
  }
}

function router(e) {
  const relativePath = location.pathname.substring(baseUrl.length);
  let view = routes[relativePath];
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
}

document.addEventListener('click', e => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    const path = e.target.getAttribute('data-link');
    history.pushState('', '', baseUrl + path);
    router();
  }
});

window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router);
