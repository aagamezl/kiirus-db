/**
 * A route in the Router module
 *
 * @typedef Route
 * @type {Object}
 * @property {Function} handler - an ID.
 * @property {Object.<string, string>} params - an ID.
 * @property {string} method - The method of the route
 * @property {RegExp} path - The RegEx for the route
 * @property {Object.<string, string>} query - Query string object
 */

const url = require('url')

const { matchAll } = require('./helpers/utils')

/** @type {Array<Route>} */
let routes = {}

/**
 *
 * @param {string} method
 * @param {string} path
 * @param {function} handler
 */
const addRoute = (method, path, handler) => {
  const route = {
    handler,
    params: matchAll(/:(\w*)/g, path).map(param => param[1]),
    path: new RegExp(`^${path.replace(/\//g, '\\/').replace(/:([A-Za-z0-9_-]+)/g, '([A-Za-z0-9_-]+)')}$`),
    method,
  }

  if (Array.isArray(routes[method]) === false) {
    routes[method] = []
  }

  routes[method].push(route)
}

/**
 * Return the defined routes
 *
 * @returns Array<Route>
 */
const getRoutes = () => {
  return routes
}

const routerMethods = {
  /**
   * Add a DELETE route handler to the router module
   *
   * @param {string} path
   * @param {function} handler
   * @returns {void}
   */
  delete: (path, handler) => {
    addRoute('DELETE', path, handler)
  },
  /**
   * Add a GET route handler to the router module
   *
   * @param {string} path
   * @param {function} handler
   * @returns {void}
   */
  get: (path, handler) => {
    addRoute('GET', path, handler)
  },
  /**
   * Add a PATH route handler to the router module
   *
   * @param {string} path
   * @param {function} handler
   * @returns {void}
   */
  patch: (path, handler) => {
    addRoute('PATCH', path, handler)
  },
  /**
   * Add a POST route handler to the router module
   *
   * @param {string} path
   * @param {function} handler
   * @returns {void}
   */
  post: (path, handler) => {
    addRoute('POST', path, handler)
  },
  /**
   * Add a PUT route handler to the router module
   * @param {string} path
   * @param {function} handler
   * @returns {void}
   */
  put: (path, handler) => {
    addRoute('PUT', path, handler)
  }
}

/**
 * Set the routes to a complete new ones
 *
 * @param {Array<Route>} newRoutes
 * @returns {void}
 */
const setRoutes = (newRoutes) => {
  routes = newRoutes
}

/**
 * Verify if a route exist
 *
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Array<Route>} The routes that match the criteria
 */
const verifyRoute = (path, method) => {
  const parsedUrl = url.parse(path, true)

  return routes[method].reduce((routes, route) => {
    let match = parsedUrl.pathname.match(route.path)

    if (match !== null) {
      match = match.slice(1)

      routes.push({
        ...route,
        // params: match.reduce((params, value, index) => {
        //   params[route.params[index]] = value

        //   return params
        // }, {}),
        params: route.params.reduce((params, key, index) => ({
          ...params,
          [key]: match[index]
        }), {}),
        query: parsedUrl.query
      })
    }

    return routes
  }, [])
}

module.exports = {
  addRoute,
  getRoutes,
  ...routerMethods,
  setRoutes,
  verifyRoute
}
