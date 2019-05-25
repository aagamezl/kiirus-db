const packageInfo = require('./../../package')

module.exports = [{
  type: 'get',
  path: '/info/version',
  handler: (request, response) => {
    response.send(JSON.stringify({ version: packageInfo.version }))
  }
}]
