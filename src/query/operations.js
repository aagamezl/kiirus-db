const equalTo = (item, key, value) => {
  return item[key] === value
}

const greaterThan = (item, key, value) => {
  return item[key] > value
}

const greaterThanOrEqual = (item, key, value) => {
  return item[key] >= value
}

const lessThan = (item, key, value) => {
  return item[key] < value
}

const lessThanOrEqual = (item, key, value) => {
  return item[key] <= value
}

const logicalAnd = (parsedOperation) => {
  return (input) => {
    // copy the array of functions
    const list = [...parsedOperation]

    let result = true
    while (list.length > 0) {
      // take the last function off the end of the list
      // and execute it
      result = result & list.shift()( input )
    }

    return Boolean(result)
  }
}

const logicalOr = (parsedOperation) => {
  return (input) => {
    // copy the array of functions
    const list = [...parsedOperation]

    let result = false
    while (list.length > 0) {
      // take the last function off the end of the list
      // and execute it
      result = result | list.shift()( input )
    }

    return Boolean(result)
  }
}

module.exports = {
  equalTo,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  logicalAnd,
  logicalOr,
}
