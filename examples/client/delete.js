const { Client } = require('./../../src/client')

const host = 'http://localhost'
const port = 8008
const database = 'test-database'

const client = new Client(host, port)
const db = client.db(database)

db.users.delete({
  'size.uom': 'in'
}).then((result) => {
  console.log(result)
}).catch((error) => {
  console.log(error)
})
