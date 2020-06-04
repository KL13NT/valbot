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
		this.calls.forEach(({ func, args }) => {
			func.apply(this, args)
		})
	}
}

module.exports = QueueController