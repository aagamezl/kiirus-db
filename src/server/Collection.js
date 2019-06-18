const crypto = require('crypto')
const path = require('path')

const { Config } = require('./../support')
const queryParser = require('./../query/parser')
const { storage } = require('./../support')

class Collection {
  /**
   *
   * @param {object} config
   * @param {string} database
   * @param {string} name
   */
  constructor (database, name) {
    this.config = Config.getInstance().values
    console.log('config: %o', this.config)

    this.database = database
    this.queryParser = queryParser
    this.name = name
  }

  /**
   * Perform a cipher over the data
   *
   * @param {*} data
   * @returns {string}
   * @memberof Collection
   */
  cipher (data) {
    return data
  }

  /**
   * Perform a decipher over the data
   *
   * @param {string} data
   * @returns {string}
   * @memberof Collection
   */
  decipher (data) {
    return data
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
      this.database,
      this.name
    )
  }

  /**
   * Select a fields set using a query expression
   *
   * @param {function|object} query
   * @return {Promise<array>}
   */
  find (query) {
    return this.getRecords(this.queryParser.build(query))
      .catch((error) => {
        return error
      })
  }

  /**
   * Read a set of files from the collection path
   *
   * @param {object} query
   * @returns {Promise<array>}
   */
  getRecords (query) {
    return new Promise(async (resolve, reject) => {
      const pathname = this.getPath()

      try {
        const files = await storage.readDir(pathname)

        const records = []

        for (const file of files) {
          const record = await storage.readJson(path.join(pathname, file))

          if (query(record) === true) {
            records.push(record)
          }
        }

        resolve(records)
      } catch (error) {
        reject(error.message)
      }
    })
  }

  /**
   * Init the collection
   *
   * @param {*} pathname
   * @returns Promise<boolean>
   * @memberof Collection
   */
  init (pathname) {
    return storage.createDir(pathname)
  }

  /**
   * Insert a data set into the collection
   *
   * @param {array} data
   * @return {Promise<boolean>}
   */
  async insert (data) {
    const pathname = this.getPath()

    await this.init(pathname)

    // const exists = await storage.exists(pathname)

    // if (exists) {
    //   return this.write(pathname, data)
    // } else {
    //   return storage.createDir(pathname).then((result) => {
    //     return this.write(pathname, data)
    //   }).catch((error) => {
    //     return error
    //   })
    // }

    // try {
    return this.write(pathname, data)
    // } catch (error) {
    //   return storage.createDir(pathname).then((result) => {
    //     return this.write(pathname, data)
    //   }).catch((error) => {
    //     return error
    //   })
    // }
  }

  /**
   * Write a ate set to a given collection and return the records ids
   *
   * @param {string} collection
   * @param {array} data
   *
   * @return {Promise<array>}
   */
  async write (collection, data) {
    const promises = []

    for (const record of data) {
      // TODO: Verify if the record come with a _id, if the record have a _id,
      // do not generate a new _id. But the Generate _id is needed to save the
      // file to the fyle system

      // TODO implement this id in the following way
      // a 4-byte value representing the seconds since the Unix epoch,
      // a 3-byte machine identifier,
      // a 2-byte process id, and
      // a 3-byte counter, starting with a random value.
      record._id = crypto.randomBytes(20).toString('hex')

      const result = await storage.writeFile(
        path.join(collection, record._id + '.json'),
        this.cipher(JSON.stringify(record))
      )

      if (result) {
        promises.push(record._id)
      }

      // promises.push(
      //   storage.writeFile(
      //     path.join(collection, record._id + '.json'),
      //     this.cipher(JSON.stringify(record))/* ,
      //     () => {
      //       return record._id
      //     } */
      //   )
      // )
    }

    // return Promise.all(promises)
    return promises
  }
}

module.exports = Collection
