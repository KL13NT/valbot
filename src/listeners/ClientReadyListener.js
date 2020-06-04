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

		const importantChannels = this.client.config.IMPORTANT_CHANNELS_ID

		Object.keys(importantChannels).forEach(channelName => {
			const channelID = importantChannels[channelName]
			this.client.config.IMPORTANT_CHANNELS[channelName] = getChannelObject(this.client, channelID)
		})

		QueueController.executeAll()

		log(this.client, 'Client ready', 'info')
	}
}

module.exports = ClientReadyListener