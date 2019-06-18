const http = require('http')

const Response = require('./Response')

/**
 *
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<Response>}
 */
const fetch = (url, options = {}, body = undefined) => {
  return new Promise((resolve, reject) => {
    const request = http.request(url, options, (response) => {
      let data = ''

      // A chunk of data has been recieved.
      response.on('data', (chunk) => {
        data += chunk
      })

      // The whole response has been received.
      response.on('end', () => {
        resolve(new Response(data, url, response))
      })
    })

    request.on('error', (error) => {
      reject(error.message)
    })

    if (body) {
      // Write data to request body
      request.write(body)
    }

    request.end()
  })
}

module.exports = exports = {
  fetch
}
