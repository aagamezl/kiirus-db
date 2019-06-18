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
    const url = `${this.host}:${this.port}`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const response = await fetch(url, options, data)
    return response.json()
  }
}

module.exports = Client
