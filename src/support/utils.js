const storage = require('./storage')

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

const getConfig = () => {
  // if (storage.exists('./kiirus-db.config', true)) {
  try {
    return storage.readJson('./kiirus-db.config', true)
  } catch (error) {
    throw new Error('[Critical]: Config file is not available.')
  }
  // } else {
  // }
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

/**
 * Set an array item to a given value using "dot" notation.
 *
 * If no path is given to the method, the entire array will be replaced.
 *
 * @param  {array}   array
 * @param  {string}  key
 * @param  {*}   value
 * @return {array}
 */
const setValue = (object, path, value) => {
  if (path === undefined) {
    object = value

    return object
  }

  const keys = path.split('.')

  while (keys.length > 1) {
    path = keys.shift()

    // If the key doesn't exist at this depth, we will just create an empty array
    // to hold the next value, allowing us to create the arrays to hold final
    // values at the correct depth. Then we'll keep digging into the array.
    if ((object[path] === undefined || object[path] === null) ||
      !Array.isArray(object[path])
    ) {
      object[path] = {}
    }

    object = object[path]
  }

  object[keys.shift()] = value

  return object
}

module.exports = {
  compose,
  getConfig,
  matchAll,
  setValue,
  storage
}
