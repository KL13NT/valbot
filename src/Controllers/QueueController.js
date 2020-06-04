const { MongoClient } = require('mongodb')
const { DATABASE_INIT_FAILED } = require('../config/events.json')

const { Controller } = require('../structures')
const { log } = require('../utils/utils')

/**
 * @global
 */
class QueueController extends Controller {
	constructor (client){
		super(client, {
			name: 'QueueController'
		})

		this.ready = false
		this.calls = []
	}

	async enqueue (func, ...args) {
		this.calls.push({
			func,
			args
		})
	}

	async executeAll () {
		this.calls.reverse().forEach(({ func, args }) => {
			func.apply(this, args)
			this.calls.pop()
		})
	}
}

module.exports = QueueController