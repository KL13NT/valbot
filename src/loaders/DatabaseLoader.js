const { Loader, Command } = require('../structures')
const Database = require('../structures/Database')

class DatabaseLoader extends Loader{
	/**
	 *
	 * @param {ValClient} client used to attach loaded commands
	 */
	constructor (client) {
		super(client)
	}

	load () {
		this.client.database = new Database()
		this.client.database.init()
	}
}

module.exports = DatabaseLoader