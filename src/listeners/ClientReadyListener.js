const path = require('path')

const { CLIENT_ID } = process.env
const { Listener } = require('../structures')
const { getChannelObject, log } = require('../utils/utils')

class ClientReadyListener extends Listener {
	constructor (client) {
		super(client, [
			'ready'
		])

		this.onReady = this.onReady.bind(this)
	}

	async onReady (){
		this.client.setPresence()
		this.client.ready = true

		this.client.ValGuild = this.client.guilds.cache.first()

		const importantChannels = this.client.config.IMPORTANT_CHANNELS_ID

		Object.keys(importantChannels).forEach(channelName => {
			const channelID = importantChannels[channelName]
			this.client.config.IMPORTANT_CHANNELS[channelName] = getChannelObject(this.client, channelID)
		})

		this.client.emit('queueExecute', 'Client ready')

		log(this.client, 'Client ready', 'info')
	}
}

module.exports = ClientReadyListener