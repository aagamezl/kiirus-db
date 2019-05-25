const { storage } = require('./storage')

const getConfig = () => {
  if (storage.exists('./kiirus-db.config', true)) {
    return storage.readJson('./kiirus-db.config', true)
  } else {
    throw new Error('[Critical]: Config file is not available.')
  }
}

/**
 * Perform a global regular expression match. Searches subject for all
 * matches to the regular expression given in pattern and return them.
 *
 * @param {Object} regex
 * @param {*} value
 * @returns {Array}
 */
const matchAll = (regex, value) => {
  let match
  const matches = []

  while ((match = regex.exec(value)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }

    // The result can be accessed through the `m`-variable.
    matches.push(match)
  }

  return matches
}

const compose = (...functions) => {
  return (result) => {
    // copy the array of functions
    const list = [...functions]

    while (list.length > 0) {
      // take the last function off the end of the list
      // and execute it
      result = list.pop()(result)
    }

    return result
  }
}

module.exports = {
  compose,
  getConfig,
  matchAll,
  storage
}
