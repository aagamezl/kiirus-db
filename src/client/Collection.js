const { CollectionProxy } = require('./../proxies')
const helpers = require('./../client/helpers')

class Collection {
  constructor (database, name, client) {
    this.client = client
    this.database = database
    this.name = name

    return CollectionProxy(this)
  }

  update (query, update) {
    const command = helpers.createCommand(
      this.constructor.name,
      'update',
      {
        database: this.database,
        collection: this.name,
        data: {
          query,
          update
        }
      }
    )

    return this.client.send(command)
  }
}

module.exports = Collection
