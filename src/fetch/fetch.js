const https = require('https')

const Response = require('./')

/**
 *
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<Response>}
 */
const fetch = (options = {}) => {
  return new Promise((resolve, reject) => {
    https.request(options, (response) => {
      let data = ''

      // A chunk of data has been recieved.
      response.on('data', (chunk) => {
        data += chunk
      })

      // The whole response has been received.
      response.on('end', () => {
        resolve(new Response(data, url, response))
      })
    }).on('error', (error) => {
      reject(error.message)
    })
  })
}

module.exports = exports = {
  fetch
}
