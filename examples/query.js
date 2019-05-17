// https://docs.mongodb.com/manual/reference/operator/query/or/

const query = require('./../src/query/parser')

const data = [
  { item: 'journal', qty: 25, size: { h: 14, w: 21, uom: 'cm' }, status: 'A' },
  { item: 'notebook', qty: 50, size: { h: 8.5, w: 11, uom: 'in' }, status: 'A' },
  { item: 'paper', qty: 100, size: { h: 8.5, w: 11, uom: 'in' }, status: 'D' },
  { item: 'planner', qty: 75, size: { h: 22.85, w: 30, uom: 'cm' }, status: 'D' },
  { item: 'postcard', qty: 45, size: { h: 10, w: 15.25, uom: 'cm' }, status: 'A' }
]

// let queryFilter = query.build({
//   qty: { $gt: 50 },
//   qty: { $lt: 100 },
//   status: 'D'
// })

// console.log(data.filter(queryFilter))

let queryFilter = query.build({
  $or: [{ qty: { $gt: 75 } }, { status: 'D' }],
  // qty: { $lt: 100 },
  // status: 'D'
})

console.log(data.filter(queryFilter))

// const equal = (item, key, value) => {
//   return item[key] === value
// }

// const lessThan = (item, key, value) => {
//   return item[key] < value
// }

// const operations = {
//   equal,
//   lessThan
// }

// const hof = (type, key, value) => {
//   return (item) => {
//       return operations[type](item, key, value)
//   }
// }

// console.log(data.filter(hof('equal', 'qty', 50)))
// console.log(data.filter(hof('lessThan', 'qty', 50)))
