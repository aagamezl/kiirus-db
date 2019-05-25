const { CollectionProxy } = require('./../proxies')

class Collection {
  constructor (database, name, client) {
    this.client = client
    this.database = database
    this.name = name

    return CollectionProxy(this)
  }
}

module.exports = Collection
