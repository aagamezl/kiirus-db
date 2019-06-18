const Collection = require('./Collection')

module.exports = class Database {
  /**
   *
   *
   * @param {*} collection
   * @returns
   */
  getCollection (collection) {
    return new Collection(this.name, collection)
  }

  use (name) {
    this.name = name
  }
}
