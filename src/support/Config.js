const { getConfig } = require('./utils')

let instance

class Config {
  constructor () {
    this.init()
  }

  async init () {
    const values = await getConfig()

    this.values = values
  }

  static getInstance () {
    if (!instance) {
      instance = new Config()
    }

    return instance
  }
}

module.exports = Config
