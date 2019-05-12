const http = require('http')

const router = require('./Router')

/**
 * @type {Object}
 * @property {Object.<string, string>} host Default host address for the server
 * @property {Object.<string, number>} port Default port number for the server
 */
const DEFAULT_CONFIG = {
  'host': '::',
  'port': 8008
}

/**
 *
 * @param {number} [port=DEFAULT_CONFIG.port]
 * @param {string} [host=DEFAULT_CONFIG.host]
 * @returns {void}
 */
const listen = (port = DEFAULT_CONFIG.port, host = DEFAULT_CONFIG.host) => {
  const server = http.createServer(requestHandler)

  server.listen(port, host, (error) => {
    if (error) {
      console.log('Something bad happened', error)

      throw new Error(`Something bad happened` + error)
    }

    console.log(`Server is listening on host ${host} and port ${port}`)
  })
}

/**
 *
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
const requestHandler = (request, response) => {
  const routes = router.verifyRoute(request.url, request.method)

  if (routes.length === 0) {
    write(response, '', 404)

    return
  }

  for (const route of routes) {
    request.params = route.params
    request.query = route.query

    switch (request.method) {
      case 'DELETE':
      case 'GET':
        route.handler(request, response)

        break

      case 'PATCH':
      case 'POST':
      case 'PUT':
        getBody(request, (body) => {
          request.body = body

          route.handler(request, response)
        })

        break
    }
  }
}

/**
 * Show the usage message for the server
 *
 */
const usage = () => {
  return [
    `  -p --port    Port to use [${DEFAULT_CONFIG.port}]`,
    `  -H --host    Address to use [${DEFAULT_CONFIG.host}]`,
    '  -s --silent  Suppress log messages from output',
    '  --cors[=headers]   Enable CORS via the "Access-Control-Allow-Origin" header',
    '                     Optionally provide CORS headers list separated by commas',
    '  -U --utc     Use UTC time format in log messages.',
    '',
    '  -P --proxy   Fallback proxy if the request cannot be resolved. e.g.: http://someurl.com',
    '',
    '  -S --ssl     Enable https.',
    '  -C --cert    Path to ssl cert file (default: cert.pem).',
    '  -K --key     Path to ssl key file (default: key.pem).',
    '',
    '  -h --help    Print this list and exit.'
  ].join('\n');
}

/**
 *
 * @param {ServerResponse} response
 * @param {string} data
 * @param {number} [statusCode=200]
 * @param {string} [contentType='application/json']
 */
const write = (response, data, statusCode = 200, contentType = 'application/json') => {
  response.setHeader('Content-Type', contentType)
  response.writeHead(statusCode)
  response.write(data)
  response.end()
}

module.exports = {
  listen,
  ...router,
  usage,
  write
}
