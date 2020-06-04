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

		log(this.client, 'Queue controller loaded', 'info')
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
			console.log(`Executed ${this.calls.pop().name} from the queue`)
		}
	}
}

module.exports = QueueController