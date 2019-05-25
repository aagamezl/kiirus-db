class Response {
  /**
   * @param {ServerResponse} response
   */
  constructor (response) {
    this.response = response
  }

  /**
   *
   * @param {string} data
   * @param {number} [statusCode=200]
   * @param {string} [contentType='application/json']
   */
  send (data, statusCode = 200, contentType = 'application/json') {
    this.response.setHeader('Content-Type', contentType)
    this.response.writeHead(statusCode)
    this.response.write(data)
    this.response.end()
  }
}

module.exports = Response
