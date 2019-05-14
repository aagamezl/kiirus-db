#!/usr/bin/env node

const server = require('./src/Server')
const { getParams } = require('./src/helpers/cli')
const packageInfo = require('./package')

const params = getParams(process.argv || {})

// console.log(params)

if (params.help || params.h) {
  console.log(server.usage())

  process.exit()
}

server.listen(params.port || params.p, params.host || params.H)

server.get('/', (request, response) => {
  server.write(response, `<h1>${packageInfo.name} ${packageInfo.version}</h1>`, 200, 'text/html')
})

server.post('/database/:id', (request, response) => {
  // console.log(request, response);
  console.log(request.params, request.query)

  server.write(response, JSON.stringify({ message: `route: ${request.url}` }))
})

server.get('/route/:id', (request, response) => {
  // console.log(request, response);
  console.log(request.params, request.query)

  server.write(response, JSON.stringify({ message: `route: ${request.url}` }))
})

server.get('/route', (request, response) => {
  // console.log(request, response);
  console.log(request.params, request.query)

  server.write(response, JSON.stringify({ message: `route: ${request.url}` }))
})

server.get('/version', (request, response) => {
  server.write(response, JSON.stringify({ version: packageInfo.version }))
})
