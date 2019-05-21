const operations = require('./operations')

let recordName = 'record'

const operators = {
  comparison: {
    '$eq': '===',
    '$gt': '>',
    '$gte': '>=',
    '$in': '$in',
    '$lt': '<',
    '$lte': '<=',
    '$ne': '!==',
    '$nin': '$nin',
  },
  logical: {
    '$and': '&&',
    '$nor': '!',
    '$not': '!',
    '$or': '||',
  }
}

/**
* Build a query filter function
*
* @param {Object} query
*
* @returns {Function}
*/
const build = (query) => {
  const queryParsed = parse(query).join(` && `)

  console.log(queryParsed)

  return new Function(recordName, `return ${queryParsed}`)
}

/**
 *
 * @param {string} type
 * @param {string} operator
 * @returns {string}
 */
const getOperator = (type, operator) => {
  return operators[type][operator]
}

/**
 *
 * @param {*} item
 * @returns {}
 */
const getType = (item) => {
  if (Array.isArray(item)) {
    return 'array'
  } else if (Object.keys(operators.logical).includes(item)) {
    return 'logical'
  } else if (Object.keys(operators.comparison).includes(item)) {
    return 'comparison'
  } else {
    return typeof item
  }
}

const isComparisonOperator = (operator) => {
  return operators.comparison[operator] !== undefined
}

const isLogicalOperator = (operator) => {
  return operators.logical[operator] !== undefined
}

const parse = (query, operator = '$eq') => {
  const queryFunction = []

  for (let [key, item] of Object.entries(query)) {
    // console.log(key, item)

    const type = getType(item)

    if (isLogicalOperator(key) || isLogicalOperator(Object.keys(item)[0])) {
      // console.log('logical')

      switch (type) {
        case 'array':
          queryFunction.push(
            `(${parseLogicalArray(item, key)})`
          )

          break

          case 'object':
            const [queryOperator, queryItem] = Object.entries(item)[0]
  
            // The only case for logical operator and type object is for $not
            queryFunction.push(`!(${parse({ [key]: queryItem }, queryOperator)[0]})`)
  
            break
      }
    } else { // is comparison operator
      // console.log('comparison')


      // const operator = getOperator('comparison', )

      switch (type) {
        case 'array':
          queryFunction.push(
            `(${parseComparisonArray(item, key, operator)})`
          )

          break
        case 'boolean':
        case 'number':
        case 'string':
          queryFunction.push(parseScalar(key, item, operator, type))

          break

        case 'object':
          const [queryOperator, queryItem] = Object.entries(item)[0]

          queryFunction.push(parse({ [key]: queryItem }, queryOperator)[0])

          break
      }
    }
  }

  return queryFunction
}

/**
 * 
 * @param {Array} item 
 * @param {string} key 
 * @param {string} operator 
 * @returns {string}
 */
const parseComparisonArray = (item, key, operator) => {
  switch (operator) {
    case '$in':
      return `[${item.join(', ')}].includes(${recordName}.${key})`

    case '$nin':
      return `![${item.join(', ')}].includes(${recordName}.${key})`
  }
}

/**
 *
 * @param {Array} query
 * @param {string} operator
 * @param {string} glue
 * @returns {string}
 */
const parseLogicalArray = (query, operator) => {
  if (operator === '$nor') {
    return `!(${query.map((value) => {
      return parse(value)
    }).join(' || ')})`
  }

  operator = getOperator('logical', operator)

  return query.map((value) => {
    return parse(value)
  }).join(` ${operator} `)
}

/**
 *
 * @param {string} key
 * @param {string} value
 * @param {string} operator
 * @param {string} type
 * @returns {string}
 */
const parseScalar = (key, value, operator, type) => {
  if (type === 'string') {
    value = `'${value}'`
  }

  operator = getOperator('comparison', operator)

  return `${recordName}.${key} ${operator} ${value}`
}

module.exports = {
  build
}