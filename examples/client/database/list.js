const { Client } = require('../../../src/client')

const host = 'http://localhost'
const port = 8008
const database = 'test-database'

const client = new Client(host, port)
const db = client.db(database)

db.list().then(databases => {
  console.log(databases)
}).catch((error) => {
  console.log(error)
})
