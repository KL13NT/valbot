const { MongoClient } = require('mongodb')
const { DATABASE_INIT_FAILED } = require('../config/events.json')


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

	}

	async init () {
		try {
			console.log('init databse')
			await this.connect()

			this._db = this.db(this.name)

			if (typeof this._db !== 'undefined') {
				this.collections = await this._db.collections()
				this.isReady = true
			}

		}
		catch (err) {
			console.log(err)
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