const http = require('http')
const os = require('os')
const path = require('path')

const { merge } = require('./helpers/object')

const DEFAULT_CONFIG = {
  'criptoAlgorithm': 'aes-256-ctr',
  'dbpath': path.join(os.homedir(), './data/db'),
  'host': '::',
  'port': 8008
}

const routes = {}

const addRoute = (verb, path, handler) => {
  routes[verb] = { [path]: handler }
}

const get = (path, handler) => {
  addRoute('GET', path, handler)
}

const listen = (port = DEFAULT_CONFIG.port, host = DEFAULT_CONFIG.host) => {
  const server = http.createServer(requestHandler)

  server.listen(port, host, (err) => {
    if (err) {
      return console.log('Something bad happened', err)
    }

    console.log(`Server is listening on ${host}:${port}`)
  })
}

const post = (path, handler) => {
  addRoute('POST', path, handler)
}

const requestHandler = (request, response) => {
  const { method, url } = request

  console.log(request)  

  switch (method) {
    case 'GET':

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
        routes[method][url](request, response)
      })

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
  get,
  listen,
  post,
  write
}

// module.exports = class Server {
//   constructor ({ criptoAlgorithm, dbpath, host, port }) {
//     this.config = merge(DEFAULT_CONFIG, ...arguments)

//     this.routes = {}

//     this.requestHandler = this.requestHandler.bind(this)

//     this.server = http.createServer(this.requestHandler)
//   }

//   post (path, handler) {
//     this.routes['POST'] = { [path]: handler }
//   }

//   requestHandler (request, response) {
//     const { method, url } = request

//     switch (method) {
//       case 'GET':

//         break

//       case 'POST':
//         let body = []

//         request.on('data', (chunk) => {
//           body.push(chunk)
//         })

//         request.on('end', () => {
//           body = Buffer.concat(body).toString()

//           if (request.headers['content-type'] === 'application/json') {
//             body = JSON.parse(body)
//           }

//           request.body = body
//           this.routes[method][url](request, response)
//         })

//         break
//     }
//   }

//   start () {
//     this.server.listen(this.config.port, (err) => {
//       if (err) {
//         return console.log('Something bad happened', err)
//       }

//       console.log(`Server is listening on ${this.config.port}`)
//     })
//   }

//   write (response, data, statusCode = 200) {
//     response.setHeader('Content-Type', 'application/json')
//     response.writeHead(statusCode)
//     response.write(data)
//     response.end()
//   }
// }
