const crypto = require('crypto')
const path = require('path')

const { Config } = require('./../support')
const queryParser = require('./../query/parser')
const { storage, utils } = require('./../support')

class Collection {
  /**
   *
   * @param {object} config
   * @param {string} database
   * @param {string} name
   */
  constructor (database, name) {
    this.config = Config.getInstance().values
    this.database = database
    this.name = name
    this.queryParser = queryParser
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
   * Delete one or many records from the collection using a query
   *
   * @param {function|string} query
   *
   * @return Promise<boolean>
   */
  async delete (query) {
    try {
      const records = await this.find(query)
      const pathname = this.getPath()

      const response = []
      for (let record of records) {
        const result = await storage.deleteFile(path.join(pathname, record._id + '.json'))

        if (result) {
          response.push(record._id)
        }
      }

      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async drop (pathname) {
    try {
      await storage.deleteDir(this.getPath())

      return true
    } catch (error) {
      throw this.getError(error)
    }
  }

  getError (error) {
    if (!error.code) {
      return error
    }

    switch (error.code) {
      case 'ENOENT':
        return new Error(`'${this.name}' collection doesn't exist`)
    }
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
  async find (query) {
    try {
      return await this.getRecords(this.queryParser.build(query))
    } catch (error) {
      throw this.getError(error)
    }
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
          try {
            const record = await storage.readJson(path.join(pathname, file))

            if (query(record) === true) {
              records.push(record)
            }
          } catch (error) {
            throw error
          }
        }

        resolve(records)
      } catch (error) {
        reject(error)
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

    return this.write(pathname, data)
  }

  list () {
    const pathname = path.join(
      this.config.dbpath,
      this.database
    )

    return storage.readDir(pathname)
  }

  /**
   * Rename a file or directory
   *
   * @param {string} newName
   * @returns {Promise<boolean|NodeJS.ErrnoException>}
   * @memberof Collection
   */
  rename (newName) {
    const newPathname = path.join(
      this.config.dbpath,
      this.database,
      newName
    )

    return storage.rename(this.getPath(), newPathname)
  }

  /**
   * Update a collection using a query to select the records to update and a
   * update object, containing the key and values to be updated
   *
   * @param {function|object} query
   * @param {object} update
   *
   * @return {Promise<array>}
   */
  async update ({ query, update }) {
    const records = await this.find(query)

    try {
      const response = []

      for (let record of records) {
        for (const [key, value] of Object.entries(update)) {
          utils.setValue(record, key, value)
        }

        const pathname = path.join(
          this.getPath(),
          record._id + '.json'
        )

        const result = await storage.writeJson(pathname, record)

        if (result) {
          response.push(record._id)
        }
      }

      return response
    } catch (e) {
      return Promise.reject(e.message)
    }
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
    const response = []

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
        response.push(record._id)
      }
    }

    return response
  }
}

module.exports = Collection
