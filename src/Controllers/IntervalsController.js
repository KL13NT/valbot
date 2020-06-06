const { promisify } = require('util')

const redis = require('redis')

const { Controller } = require('../structures')
const { log } = require('../utils/utils')


class IntervalsController extends Controller {
	constructor (client){
		super(client, {
			name: 'IntervalsController'
		})
		this.ready = true
		this.intervals = {}
	}

	setInterval (interval, intervalOptions, callback){
		const { name } = intervalOptions

		if(this.intervals[name]) this.clearInterval(name)

		this.intervals[name] = setInterval(callback, interval)
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