const http = require('http')
const os = require('os')
const path = require('path')
const url = require('url')

// const { routerMethods, verifyRoute } = require('./Router')
const router = require('./Router')

const DEFAULT_CONFIG = {
  'host': '::',
  'port': 8008
}

const listen = (port = DEFAULT_CONFIG.port, host = DEFAULT_CONFIG.host) => {
  const server = http.createServer(requestHandler)

  // server.listen(0, () => console.log(server.address().port))

  server.listen(port, host, (error) => {
    if (error) {
      console.log('Something bad happened', error)

      throw new Error(`Something bad happened` + error)
    }

    console.log(`Server is listening on host ${host} and port ${port}`)
  })
}

const requestHandler = (request, response) => {
  const parsedUrl = url.parse(request.url, true)
  const route = router.verifyRoute(parsedUrl.pathname, request.method)

  if (route === undefined) {
    write(response, '', 404)
  }

  request.params = route.params || {}
  request.query = parsedUrl.query || {}

  switch (request.method) {
    case 'DELETE':
      break

    case 'GET':
      route.handler(request, response)

      break

    case 'PATH':
      break

    case 'POST':
      let body = []

      request.on('data', (chunk) => {
        body.push(chunk)
      })

      request.on('end', () => {
        body = Buffer.concat(body).toString()

        if (request.headers['content-type'] === 'application/json') {
          body = JSON.parse(body)
        }

        request.body = body

        route.handler(request, response)
      })

      break

    case 'PUT':
      break
  }
}

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

const write = (response, data, statusCode = 200) => {
  response.setHeader('Content-Type', 'application/json')
  response.writeHead(statusCode)
  response.write(data)
  response.end()
}

module.exports = {
  // get,
  listen,
  // post,
  ...router,
  usage,
  write
}
