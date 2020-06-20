const { Listener } = require('../structures')
const { log } = require('../utils/utils')

class ClientReadyListener extends Listener {
	constructor(client) {
		super(client, ['ready'])

		this.onReady = this.onReady.bind(this)
	}

	async onReady() {
		this.client.setPresence()

		this.client.ValGuild = this.client.guilds.cache.first()
		this.client.emit('queueExecute', 'Client ready')

		log(this.client, 'Client ready', 'info')
	}
}

module.exports = ClientReadyListener
