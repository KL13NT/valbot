const path = require('path')

const { CLIENT_ID } = process.env
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
		console.log('Client ready')
		this.setPresence()
		this.ready = true
	}

}

module.exports = ClientReadyListener