const getBoolean = (value) => {
  if (['true', 'yes', '1'].includes(value)) {
    return true;
  } else if (['false', 'no', '0'].includes(value)) {
    return false
  }
}

const getParams = (params) => {
  let previous

  const options = params.slice(2).reduce((accumulator, current) => {
    if (!current.startsWith('--')) {
      accumulator[previous.slice(2)] = isBoolean(current) ? getBoolean(current) : current
    } else {
      previous = current
      accumulator[current.slice(2)] = true
    }

    return accumulator
  }, {})

  return options
}

const isBoolean = (value) => {
  if (['true', 'yes', '1', 'false', 'no', '0'].includes(value)) {
    return true;
  }

  return false;
}

module.exports = {
  getParams
}
