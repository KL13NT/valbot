const { MongoClient } = require('mongodb')
const client = new MongoClient('mongodb://localhost:27017/valariumBot', { useNewUrlParser: true })

function errHandle (errCode){
  const errCodes = {
    1: 'Failed to init DB',
    3: 'Failed to get [_db] object'
  }
  console.error(errCodes[errCode])
}

let _db

const dbInfo = {
  initDB: async function (){
    try{
      await client.connect()
      _db = client.db('valariumBotSandbox')
      console.log('Initialised DB!')
    }
    catch(err){
      errHandle(1)
    }
  },
  getDB: async function (){
    try{
      if(!_db){  
        await this.initDB()
      }
      return _db
    }
    catch(err){
      errHandle(3)
    }
  }
}

module.exports = dbInfo