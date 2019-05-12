const merge = (target, source) => {
  Object.keys(source).forEach((key) => {
    target[key] = source[key] ? source[key] : target[key]
  })

  return target
}

module.exports = {
  merge
}