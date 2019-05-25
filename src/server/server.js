const http = require('http')

const Response = require('./Response')
const router = require('./router')

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
 * Read the body content from the request stream
 *
 * @param {IncomingMessage} request
 * @param {Function} callback
 */
const getBody = (request, callback) => {
  const bodyBuffer = []

  request.on('data', (chunk) => {
    bodyBuffer.push(chunk)
  })

  request.on('end', () => {
    const body = Buffer.concat(bodyBuffer).toString()

    if (request.headers['content-type'] === 'application/json') {
      return callback(JSON.parse(body))
    }

    callback(body)
  })
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
    new Response(response).send('', 404)

    return
  }

  for (const route of routes) {
    request.params = route.params
    request.query = route.query

    switch (request.method) {
      case 'DELETE':
      case 'GET':
        route.handler(request, new Response(response))

        break

      case 'PATCH':
      case 'POST':
      case 'PUT':
        getBody(request, (body) => {
          request.body = body

          route.handler(request, new Response(response))
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
  ].join('\n')
}

module.exports = {
  listen,
  ...router,
  usage
}
