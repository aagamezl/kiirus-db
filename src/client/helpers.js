const createCommand = (type, name, options) => {
  return JSON.stringify({ command: `${type.toLowerCase()}-${name}`, options })
}

module.exports = {
  createCommand
}
