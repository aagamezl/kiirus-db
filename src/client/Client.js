const Database = require('./Database')
const { fetch } = require('./../fetch')

class Client {
  constructor (host, port) {
    this.host = host
    this.port = port
  }

  db (name) {
    return new Database(name, this)
  }

  async send (data, contentType = 'application/json') {
    const options = {
      hostname: this.host,
      port: this.port,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const response = await fetch(options)
  }
}

module.exports = Client
