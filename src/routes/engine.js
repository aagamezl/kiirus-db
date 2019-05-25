module.exports = [{
  type: 'post',
  path: '/',
  handler: (request, response) => {
    const { command, options } = request.body
    const [ type, operation ] = command.split('-')

    console.log(command, options)
    console.log(type, operation)

    response.send(JSON.stringify(request.body))
  }
}]
