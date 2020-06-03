const { promisify } = require('util')

const redis = require('redis')

const { Controller } = require('../structures')
const { log } = require('../utils/utils')


class RedisController extends Controller {
	constructor (client){
		super(client, {
			name: 'RedisController'
		})
		this.ready = false

		this.redis = redis.createClient(process.env.REDIS_URL)
		this.getAsync = promisify(this.redis.get).bind(this.redis)

		this.redis.on('ready', () => {
			this.ready = true
			const message = 'Redis controller ready!'

			log(this.client, message, 'info')
		})

		this.redis.on('error', (err) => {
			const message = `Something went wrong when initialising Redis, ${err.message}, <@238009405176676352>`

			log(this.client, message, 'error')
		})
	}

	set (key, value){
		if(this.ready) this.redis.set(key, value, (err, ok) => {
			if(err) log(this.client, err, 'error')
		})
	}

	get (key){
		if(this.ready) {
			return this.getAsync(key)
		}
		else throw Error ('Redis not ready yet')
	}

	incr (key){
		if(this.ready && this.redis.exists(key)) this.redis.incr(key)
	}

	incrby (key, by){
		if(this.ready && this.redis.exists(key)) this.redis.incrby(key, by)
	}
}

module.exports = RedisController