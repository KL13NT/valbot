const path = require('path')

const { CLIENT_ID } = process.env
const { Listener } = require('../structures')
const { getChannelObject } = require('../utils/utils')

class ClientReadyListener extends Listener {
	constructor (client) {
		super(client, [
			'ready'
		])

		this.onReady = this.onReady.bind(this)
	}

	async onReady (){
		console.log('Client ready')
		this.client.setPresence()
		this.client.isReady = true

		const importantChannels = this.client.config.IMPORTANT_CHANNELS_ID
		Object.keys(importantChannels).forEach(channelName => {
			const channelID = importantChannels[channelName]
			this.client.config.IMPORTANT_CHANNELS[channelName] = getChannelObject(this.client, channelID)
		})

		this.client.queue.executeAll()
	}

}

module.exports = ClientReadyListener