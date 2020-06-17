const path = require('path')

const { CLIENT_ID } = process.env
const { Listener } = require('../structures')
const { getChannelObject, log } = require('../utils/utils')

class QueueExecuteListener extends Listener {
	constructor (client) {
		super(client, [
			'queueExecute'
		])

		this.onQueueExecute = this.onQueueExecute.bind(this)
	}

	async onQueueExecute (reason){
		this.client.controllers.queue.executeAll()
		log(this.client, `Executing all queued calls. Reason: ${reason}`, 'info')
	}
}

module.exports = QueueExecuteListener