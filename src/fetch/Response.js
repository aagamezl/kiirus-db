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

  /**
   * Return the json representation of the Response body
   *
   * @returns {object}
   * @memberof Response
   */
  json () {
    return JSON.parse(this.body)
  }

  /**
   * Return the string representation of the Response body
   *
   * @returns {string}
   * @memberof Response
   */
  text () {
    return this.body
  }
}

module.exports = Response
