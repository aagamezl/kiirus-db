#!/usr/bin/env node

const { getParams } = require('./src/helpers/cli')
// const Server = require('./src/Server')
const server = require('./src/Server')

const params = getParams(process.argv)

// console.log(params)

if (params.help || params.h) {
  console.log(server.usage())

  process.exit();
}

server.listen(params.port || params.p, params.host || params.H)

server.get('/version', (request, response) => {
  server.write(response, JSON.stringify({ message: 'server post' }))
})

// const server = new Server(params)

// server.post('/', (request, response) => {
//   server.write(response, JSON.stringify({ message: 'server post' }))
// })

// server.start()
