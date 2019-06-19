/**
 * Create a Proxy for Database
 *
 * @param {object} oldPath
 * @param {function} newPath
 *
 * @returns {Promsie<boolean|NodeJS.ErrnoException>}
 */
const simpleTarget = (targetObject, defaultFunction = undefined) => {
  return new Proxy(targetObject, {
    get (target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property)
      } else if (defaultFunction !== undefined) {
        return target[defaultFunction](property)
      }
    },
    getPrototypeOf (target) {
      return Object.getPrototypeOf(target)
    }
  })
}

module.exports = exports = simpleTarget