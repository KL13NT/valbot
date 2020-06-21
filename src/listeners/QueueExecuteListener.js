const { Listener } = require('../structures')
const { log } = require('../utils/general')

class QueueExecuteListener extends Listener {
	constructor(client) {
		super(client, ['queueExecute'])

		this.onQueueExecute = this.onQueueExecute.bind(this)
	}

	async onQueueExecute(reason) {
		this.client.controllers.queue.executeAll()
		log(this.client, `Executing all queued calls. Reason: ${reason}`, 'info')
	}
}

module.exports = QueueExecuteListener
