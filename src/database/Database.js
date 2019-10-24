const { MongoClient } = require('mongodb')

module.exports = class Databse{
  constructor (DB_HOST = process.env.DB_HOST, DB_NAME = process.env.DB_NAME) {
    this.HOST = DB_HOST
    this.NAME = DB_NAME
    this.client = new MongoClient(`${ this.HOST }`, { useNewUrlParser: true })
    
    this.init()
  }

  async init () {
    try {
      const success = this.initDB()
      if (!success) throw Error('Couldn\'t initalise DB')
      else console.log('Initialised DB!')
    }
    catch (err) {
      console.log(err, 'Retrying')
      this.init()
    }
  }

  async initDB () {
    await this.client.connect()
    this._db = this.client.db(this.NAME)
    
    return true
  }

  //TODO: Add databse setters and getters
}