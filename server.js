#!/usr/bin/env node

const { server } = require('./src/server')
const { cli } = require('./src/support')
const routes = require('./src/routes')

const params = cli.getParams(process.argv || {})

if (params.help || params.h) {
  console.log(server.usage())

  process.exit()
}

server.listen(params.port || params.p, params.host || params.H)

for (let [, routesDefinition] of Object.entries(routes)) {
  for (let route of routesDefinition) {
    server[route.type](route.path, route.handler)
  }
}
