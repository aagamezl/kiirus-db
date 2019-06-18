class Response {
  /**
   * Create a new Response object
   *
   * @param {string} body
   * @param {string} url
   * @param {object} response
   */
  constructor (body, url, response) {
    this.body = body
    // this.headers = response.headers
    // this.statusCode = response.statusCode
    this.base = response
    this.url = url
  }

  json () {
    return JSON.parse(this.body)
  }

  text () {
    return this.body
  }
}

module.exports = Response
