const { MongoClient } = require('mongodb')
const { ERROR_DATABASE_INIT_FAILED } = require('../config/events.json')
const { createCollection, getCollection } = require('../utils/database')

class Database extends MongoClient{
	/**
	 * @param { string } host
	 * @param { string } name
	 */
	constructor (host = process.env.DB_HOST, name = process.env.DB_NAME) {
		super(host, { useNewUrlParser: true })

		this.host = host
		this.name = name
		this.collections = []
		this.isReady = false

		this.getDb = this.getDb.bind(this)
	}

	init () {
		try {
			console.log('init databse')

			this.connect().then(() => {
				this._db = this.db(this.name)
				this.emit('ready', this)
				this.isReady = true
			})


		}
		catch (err) {
			console.log(ERROR_DATABASE_INIT_FAILED)
		}
	}

	getDb (){
		return this.db(this.name)
	}

	ready (){
		return this.isReady
	}
}


module.exports = Database