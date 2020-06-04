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
		for(let i = this.calls.length - 1; i >= 0; i--){
			this.calls[i].func.apply(this, this.calls[i].args)
			this.calls.pop()
		}
	}
}

module.exports = QueueController