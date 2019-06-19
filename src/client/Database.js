const Collection = require('./Collection')
const { SimpleTarget } = require('../proxies')
const helpers = require('./../client/helpers')

class Database {
  /**
   * Creates an instance of Database.
   *
   * @param {string} name
   * @param {Client} client
   * @memberof Database
   */
  constructor (name, client) {
    this.client = client
    this.name = name

    return SimpleTarget(this, 'getCollection')
  }

  /**
   * Drop a database from the fyle system
   *
   * @returns {string}
   * @memberof Database
   */
  drop () {
    const command = helpers.createCommand(
      this.constructor.name,
      'drop',
      {
        database: this.name
      }
    )

    return this.client.send(command)
  }

  /**
   * Return a Collection object, configurated for the given collection
   *
   * @param {string} collection
   * @returns {Collection}
   */
  getCollection (collection) {
    return new Collection(this.name, collection, this.client)
  }

  list () {
    const command = helpers.createCommand(
      this.constructor.name,
      'list'
    )

    return this.client.send(command)
  }
}

module.exports = Database
