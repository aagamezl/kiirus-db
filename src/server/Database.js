const path = require('path')

const { Config } = require('./../support')
const Collection = require('./Collection')
const { storage } = require('./../support')

module.exports = class Database {
  /**
   *
   * @param {object} config
   * @param {string} database
   * @param {string} name
   */
  constructor () {
    this.config = Config.getInstance().values
    this.name = ''
  }

  drop (database) {
    const pathname = path.join(
      this.config.dbpath,
      database
    )

    return storage.deleteDir(pathname)
  }

  /**
   *
   *
   * @param {*} collection
   * @returns
   */
  getCollection (collection) {
    return new Collection(this.name, collection)
  }

  /**
   * Return the collection path
   *
   * @returns {string}
   * @memberof Collection
   */
  getPath () {
    return path.join(
      this.config.dbpath,
      this.name
    )
  }

  list () {
    return storage.readDir(this.config.dbpath)
  }

  use (name) {
    this.name = name
  }
}
