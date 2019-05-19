const operations = require('./operations')

let recordName = 'record'

const operators = {
  comparision: {
    // '$eq': '===',
    '$eq': 'equalTo',
    // '$gt': '>',
    '$gt': 'greaterThan',
    // '$gte': '>=',
    '$gte': 'greaterThanOrEqual',
    '$in': '$in',
    // '$lt': '<',
    '$lt': 'lessThan',
    // '$lte': '<=',
    '$lte': 'lessThanOrEqual',
    '$ne': '!==',
    '$nin': '$nin',
    '$nor': '$nor',
  },
  logical: {
    // '$and': '&&',
    '$and': operations.logicalAnd,
    '$not': '!',
    // '$or': '||',
    '$or': operations.logicalOr,
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
  // const parsedQuery = parse(query)

  // console.log(compose(...[parse(query).reverse()]))

  // return new Function(recordName, `return ${parse(query).join(` && `)}`)
  
  // return compose(...[parse(query).reverse()])
  return pipe.apply(null, parse(query))

  // return parsedQuery.reduce((previous, current, index) => {
  //   return current()
  // })
}

const getOperator = (operator) => {
  // return operators.comparision[operator] || operator
  return operators.comparision[operator] || operators.logical[operator] || operator
}

/**
 * Returns the record name
 *
 * @return {string}
 */
const getRecordName = () => {
  return recordName
}

const getType = (item) => {
  if (Array.isArray(item)) {
    return 'array'
  } else if (Object.keys(operators.logical).includes(item)) {
    return 'logical'
  } else if (Object.keys(operators.comparision).includes(item)) {
    return 'comparision'
  } else {
    return typeof item
  }
}

/**
 * Parse a query expression and returns the set of part that compose it
 *
 * @param {Object} query
 * @param {string} operator
 * @param {string} glue
 *
 * @returns {Array}
 */
const parse = (query, operator = '$eq', glue = '&&') => {
  let queryFunction = []

  for (let [key, item] of Object.entries(query)) {
    // operator = operators.comparision[key] ? key : operator
    operator = operators.comparision[key] ? key : operators.logical[key] ? key : operator

    const type = getType(item)

    switch (type) {
      case 'array':
        if (operators.comparision[operator]) {
          queryFunction.push(
            parseComparation(item, key, operators.comparision[operator])
          )
        } else {
          // queryFunction.push(
          //   `(${parseArray(item, key, operators.logical[key])})`
          // )
          // queryFunction = parseArray(item, key, operators.logical[key])
          // queryFunction = parseArray(item, key, operators.logical[key])
          queryFunction.push(parseLogical(item, key))
        }

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

  return queryFunction
}

const parseArray = (query, operator, glue) => {
  // return query.map((value) => {
  //   return parse(value)
  // }).join(` ${glue} `)
  return query.reduce((value) => {
    return parse(value, operator)
  })
}

const parseLogical = (item, operator) => {
  const parsedOperation = item.reduce((previous, value) => {
    previous = previous.concat(parse(value))

    return previous
  }, [])

  // return operators.logical[operator].apply(null, parsedOperation)
  return operators.logical[operator](parsedOperation)

  // return (item) => {
  //   // copy the array of functions
  //   const list = [...parsedLogical]

  //   let result = 0
  //   while (list.length > 0) {
  //     // take the last function off the end of the list
  //     // and execute it
  //     result = result | list.shift()( item )
  //   }

  //   return result
  // }
}

const parseComparation = (item, key, operator) => {
  switch (operator) {
    case '$in':
      return `[${item.join(', ')}].includes(${recordName}.${key})`

    case '$nin':
      return `![${item.join(', ')}].includes(${recordName}.${key})`

    case '$nor':
      return `!(${parseArray(item, key, '||')})`
  }
}

const parseScalar = (key, value, operator, type) => {
  // if (type === 'string') {
  //   value = `'${value}'`
  // }

  operator = getOperator(operator)

  // return `${recordName}.${key} ${operator} ${value}`
  return hof(operator, key, value)
}

const pipe = (...functions) => {
  return (input) => {
    // copy the array of functions
    const list = [...functions]

    let result = true
    while (list.length > 0) {
      // take the last function off the end of the list
      // and execute it
      result = result & list.shift()( input )
    }

    return Boolean(result)
  }
}

const setRecordName = (name = 'record') => {
  recordName = name
}

const hof = (type, key, value) => {
  return (item) => {
    return operations[type](item, key, value)
  }
}

module.exports = {
  build,
  getRecordName,
  setRecordName
}