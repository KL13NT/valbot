const { MongoClient } = require('mongodb')


/**
 * @constructor
 * @param { String } DB_HOST
 * @param { String } DB_NAME
 */

module.exports = class Database extends MongoClient{
  constructor (host = process.env.DB_HOST, name = process.env.DB_NAME) {
    super(host, { useNewUrlParser: true })

    this.host = host
    this.name = name
    
    this.isReady = false

    this.init()
  }

  async init () {
    try {
      this.isReady = await this.initDB()
      
      if (!this.isReady) throw Error('Couldn\'t initalise DB')
      else console.log('Initialised DB!')
    }
    catch (err) {
      console.log(err)
    }
  }

  async initDB () {
    try {
      await this.connect()
      this._db = this.db(this.NAME)
      
      if (typeof this._db !== 'undefined') return true
      
      return false
    }
    catch (err) {
      console.log(err)
    }
  }

  //TODO: Add databse setters and getters 
}
