const { promisify } = require('util')

const redis = require('redis')

const { Controller } = require('../structures')
const { log } = require('../utils/utils')


class RedisController extends Controller {
	constructor (client){
		super(client, {
			name: 'redis'
		})
		this.ready = false

		this.redis = redis.createClient(process.env.REDIS_URL)
		this.getAsync = promisify(this.redis.get).bind(this.redis)

		this.readyListener = this.readyListener.bind(this)
		this.errorListener = this.errorListener.bind(this)

		this.set = this.set.bind(this)
		this.get = this.get.bind(this)
		this.incr = this.incr.bind(this)
		this.incrby = this.incrby.bind(this)

		this.redis.on('ready', this.readyListener)
		this.redis.on('error', this.errorListener)
	}

	errorListener (err){
		const message = `Something went wrong when initialising Redis, ${err.message}, <@238009405176676352>`

		log(this.client, message, 'error')
		this.redis.removeAllListeners()
		delete this.client.controllers.redis
	}

	readyListener (){
		log(this.client, 'Redis controller ready', 'info')
		this.client.emit('queueExecute', 'Redis controller ready')

		this.ready = true

		this.redis.removeListener('ready', this.readyListener)
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