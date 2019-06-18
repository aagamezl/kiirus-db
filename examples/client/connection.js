const { Client } = require('../../src/client')

const host = '::'
const port = 8008
const database = 'test-database'

const client = new Client(host, port)
const db = client.db(database)

console.log(client, db)
