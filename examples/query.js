// https://docs.mongodb.com/manual/reference/operator/query/or/

const query = require('./../src/query/parser')

const data = [
  { item: 'canvas', qty: 100, size: { h: 28, w: 35.5, uom: 'cm' }, status: 'A' },
  { item: 'journal', qty: 25, size: { h: 14, w: 21, uom: 'cm' }, status: 'A' },
  { item: 'mat', qty: 85, size: { h: 27.9, w: 35.5, uom: 'cm' }, status: 'A' },
  { item: 'mousepad', qty: 25, size: { h: 19, w: 22.85, uom: 'cm' }, status: 'P' },
  { item: 'notebook', qty: 50, size: { h: 8.5, w: 11, uom: 'in' }, status: 'P' },
  { item: 'paper', qty: 100, size: { h: 8.5, w: 11, uom: 'in' }, status: 'D' },
  { item: 'planner', qty: 75, size: { h: 22.85, w: 30, uom: 'cm' }, status: 'D' },
  { item: 'postcard', qty: 45, size: { h: 10, w: 15.25, uom: 'cm' }, status: 'A' },
  { item: 'sketchbook', qty: 80, size: { h: 14, w: 21, uom: 'cm' }, status: 'A' },
  { item: 'sketch pad', qty: 95, size: { h: 22.85, w: 30.5, uom: 'cm' }, status: 'A' }
]

let queryFilter = query.build({
  qty: { $gt: 50 }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: 50
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: { $gt: 50 },
  item: 'paper'
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: { $lte: 50 }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: { $in: [50, 75] }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: { $nin: [50, 75] }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  $and: [ { qty: { $ne: 25 } }, { status: { $eq: 'A' } } ]
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  $or: [ { qty: { $ne: 25 } }, { status: { $eq: 'D' } } ]
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  $or: [ { qty: { $ne: 25 } }, { status: { $eq: 'D' } } ],
  $and: [ { qty: { $ne: 25 } }, { status: { $eq: 'A' } } ]
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  price: { $not: { $gt: 1.99 } }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: { $gt: 50 },
  'size.h': { $gt: 22 },
  status: 'D'
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  $or: [{ qty: { $gt: 75 } }, { status: 'D' }],
  qty: { $lt: 100 }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  $and: [{ qty: { $gt: 25 } }, { qty: { $lte: 75 } }],
  $or: [{ qty: { $gt: 75 } }, { status: 'D' }],
  status: 'D'
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  qty: { $not: { $gt: 75 } }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  price: { $not: { $gte: 1.99 } }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  $nor: [{ qty: { $gt: 25 } }, { status: { $eq: 'D' } }]
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  status: { $in: [ 'D', 'P' ] }
})

console.log(data.filter(queryFilter))

queryFilter = query.build({
  status: { $nin: [ 'A', 'D' ] }
})

console.log(data.filter(queryFilter))
