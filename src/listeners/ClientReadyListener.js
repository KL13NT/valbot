const path = require('path')

const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { CommandContext } = require('..')
const { Listener } = require('../structures')
const { getChannelObject } = require('../utils/utils')

class ClientReadyListener extends Listener {
	constructor (client) {
		super(client, [
			'ready'
		])
	}

	async onReady (){
		this.setPresence()
	}

}

module.exports = ClientReadyListener