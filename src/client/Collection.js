const { CollectionProxy } = require('./../proxies')
const helpers = require('./../client/helpers')

class Collection {
  /**
   * Creates an instance of Collection.
   * @param {string} database
   * @param {string} name
   * @param {Client} client
   * @memberof Collection
   */
  constructor (database, name, client) {
    this.client = client
    this.database = database
    this.name = name

    return CollectionProxy(this)
  }

  list () {
    const command = helpers.createCommand(
      this.constructor.name,
      'list',
      {
        database: this.database
      }
    )

    return this.client.send(command)
  }

  /**
   * Update a collection
   *
   * @param {object} query
   * @param {object} update
   * @returns {string}
   * @memberof Collection
   */
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
