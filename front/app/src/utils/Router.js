import RouteRecord from './RouteRecord.js';

class Router {
  constructor(options = {}) {
    // validate options
    this.#validateOptions(options);

    // initialize properties
    this.useHash = Boolean(options.useHash);
    this.baseUrl = options.baseUrl || location.origin;
    this.linkAttribute = options.linkAttribute || 'router-link';
    this.linkActiveClass = options.linkActiveClass || 'router-link-active';
    this.routes = (options.routes || []).map(r => new RouteRecord(r));
    this.fallbackRouteName = options.fallbackRouteName;
    this.fallbackRoute = this.routes.find(r => r.name === this.fallbackRouteName) || null;
    this.renderTarget = options.renderTarget || '#router-view';

    // bind public methods
    this.init = this.init.bind(this);
    this.push = this.push.bind(this);
    this.handleRouteChange = this.handleRouteChange.bind(this);
  }

  #validateOptions(options) {
    if (!options || typeof options !== 'object') {
      throw new Error(`Invalid Router: constructor expects an object.`);
    }
    if (!['string', 'undefined'].includes(typeof options.renderTarget)) {
      throw new Error(`Invalid Router: 'renderTarget' must be a string selector ('#router-view' by default).`);
    }
  }

  handleRouteChange() {
    const url = new URL(location.href);
    const href = this.useHash ? url.hash.slice(1) || '/' : url.pathname + url.search;

    const resolved = this.#resolve(href);
    if (resolved) {
      this.currentRoute = JSON.parse(JSON.stringify(resolved));
      this.#render(resolved);
    } else if (this.fallbackRoute) {
      this.currentRoute = JSON.parse(JSON.stringify(this.fallbackRoute));
      this.#render({ route: this.fallbackRoute });
    }
  }

  #resolve(href) {
    const hrefArr = href.split('?');
    let path = hrefArr[0];
    let query = Object.fromEntries(new URLSearchParams(hrefArr[1] || ''));

    for (const route of this.routes) {
      const params = route.match(path);
      if (params) {
        return { href, route, params, query };
      }
    }
    return null;
  }

  async #render(resolved) {
    if (!resolved || !resolved.route) return;

    const { route, params, query } = resolved;

    if (route.beforeEnter) {
      const canEnterRoute = await route.beforeEnter();
      if (!canEnterRoute) return;
    }
    document.title = route.title || '';

    const target = document.querySelector(this.renderTarget);
    if (!target) return;

    if (typeof route.template === 'function') {
      target.innerHTML = route.template(params, query);
    } else {
      target.innerHTML = route.template || '';
    }

    this.#updateLinkActiveClass();
  }

  #updateLinkActiveClass() {
    if (!this.linkAttribute || !this.linkActiveClass) return;

    document.querySelectorAll(`[${this.linkAttribute}]`).forEach(linkEl => {
      const linkHref = linkEl.getAttribute(this.linkAttribute);
      if (linkHref === this.currentRoute.href) {
        linkEl.classList.add(this.linkActiveClass);
      } else {
        linkEl.classList.remove(this.linkActiveClass);
      }
    });
  }

  init() {
    // handle initial route
    window.addEventListener('DOMContentLoaded', this.handleRouteChange);

    // handle route changes
    window.addEventListener('popstate', this.handleRouteChange);

    // handle hash changes
    if (this.useHash) {
      window.addEventListener('hashchange', this.handleRouteChange);
    }

    // handle link clicks
    document.addEventListener('click', e => {
      if (this.linkAttribute) {
        const linkEl = e.target.closest(`[${this.linkAttribute}]`);
        if (linkEl) {
          e.preventDefault();
          const path = linkEl.getAttribute(this.linkAttribute);
          this.push(path);
        }
      }
    });
  }

  push(path) {
    const fullPath = this.baseUrl + (this.useHash ? '/#' : '') + path;
    history.pushState({}, '', fullPath);
    this.handleRouteChange();
  }
}

export default Router;
