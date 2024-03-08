class RouteRecord {
  constructor(options, index) {
    // validate options
    this.#validateOptions(options, index);

    // initialize properties
    this.name = options.name;
    this.path = options.path;
    this.template = options.template;
    this.beforeEnter = options.beforeEnter;
    this.title = options.title;
    this.regex = this.#getRegex(options.path);
    this.paramNames = this.#getParamNames(options.path);

    // bind public methods
    this.match = this.match.bind(this);
  }

  #validateOptions(options, index) {
    const indexStr = isNaN(index) ? '' : ` (${index})`;
    if (!options || typeof options !== 'object') {
      throw new Error(`Invalid RouteRecord${indexStr}: constructor expects an object.`);
    }
    if (typeof options.name !== 'string') {
      throw new Error(`Invalid RouteRecord${indexStr}: 'name' must be a string.`);
    }
    if (typeof options.path !== 'string' || !options.path.startsWith('/')) {
      throw new Error(`Invalid RouteRecord${indexStr}: 'path' must be a string starting with '/'.`);
    }
    if (!['string', 'function'].includes(typeof options.template)) {
      throw new Error(`Invalid RouteRecord${indexStr}: 'template' must be a string or a function.`);
    }
  }

  #getRegex(path) {
    const regexStr = path
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/(:\w+)/g, '(\\w+)'); // Convert params to regex
    return new RegExp(`^${regexStr}$`);
  }

  #getParamNames(path) {
    const paramNames = (path.match(/(:\w+)/g) || []).map(paramName => paramName.substr(1));
    return paramNames;
  }

  match(path) {
    const matches = path.match(this.regex);
    if (matches === null) return null;
    if (matches.some(v => v === '')) return null;
    const params = {};
    this.paramNames.forEach((paramName, i) => {
      params[paramName] = matches[i + 1];
    });
    return params;
  }
}

export default RouteRecord;
