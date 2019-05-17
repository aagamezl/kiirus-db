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

const logicalOr = (item, key, value) => {
  return item[key] <= value
}

module.exports = {
  equalTo,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  logicalOr,
}
