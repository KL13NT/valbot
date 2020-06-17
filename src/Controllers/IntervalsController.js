const { promisify } = require('util')

const redis = require('redis')

const { Controller } = require('../structures')
const { log } = require('../utils/utils')


class IntervalsController extends Controller {
	constructor (client){
		super(client, {
			name: 'intervals'
		})
		this.ready = true
		this.intervals = {}

		this.setInterval = this.setInterval.bind(this)
		this.clearInterval = this.clearInterval.bind(this)
		this.exists = this.exists.bind(this)
	}

	setInterval (time, intervalOptions, callback){
		const { name } = intervalOptions

		if(this.intervals[name]) this.clearInterval(name)

		this.intervals[name] = setInterval(callback, time)
	}

	clearInterval (name){
		clearInterval(this.intervals[name])
		delete this.intervals[name]
	}

	exists (name){
		return this.intervals[name]? true: false
	}
}

module.exports = IntervalsController