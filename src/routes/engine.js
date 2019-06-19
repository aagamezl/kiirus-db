const { Database } = require('./../server')

module.exports = [{
  type: 'post',
  path: '/',
  /**
   *
   * @param {IncomingMessage} request
   * @param {Response} response
  */
  handler: (request, response) => {
    const { command, options } = request.body
    const [ type, operation ] = command.split('-')

    console.log('command: %o', request.body)
    console.log('type: %s, operation: %s', type, operation)

    const database = new Database()

    switch (type) {
      case 'collection':
        database.use(options.database)

        try {
          database.getCollection(options.collection)[operation](options.data)
            .then((result) => {
              response.send(JSON.stringify(result))
            }).catch((error) => {
              console.log(error)

              response.send(JSON.stringify({ message: error.message }), 500)
            })
        } catch (e) {
          // TODO Manage the error in a proper way
          response.send(JSON.stringify({ message: 'Unexpected error.' }), 500)
        }

        break

      case 'database':
        try {
          database[operation](options).then((result) => {
            response.send(JSON.stringify(result))
          }).catch((error) => {
            console.log(error)

            response.send(error.message, 500)
          })
        } catch (error) {
          response.send(JSON.stringify({ message: 'Unexpected error.' }), 500)
        }

        break
    }
  }
}]
