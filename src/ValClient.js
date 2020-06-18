const { Client } = require('discord.js')

const fs = require('fs')
const path = require('path')
const Loaders = require('./loaders')
const Listeners = require('./listeners')

const { log } = require('./utils/utils')

/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

class ValClient extends Client {
	constructor(options = {}, prefix) {
		super(options)

		this.ready = false
		this.prefix = prefix || process.env.MODE === 'DEVELOPMENT' ? 'vd!' : 'v!'
		this.commands = {}
		this.controllers = {}
		this.config = {}

		this.ValGuild = {}

		this.init = this.init.bind(this)
		this.initLoaders = this.initLoaders.bind(this)
		this.initConfig = this.initConfig.bind(this)
		this.initListeners = this.initListeners.bind(this)
	}

	async init(token = process.env.AUTH_TOKEN) {
		try {
			this.login(token)

			await this.initLoaders()
			await this.initConfig()
			await this.initListeners()

			console.log(
				fs
					.readFileSync(path.resolve(__dirname, './text/bigtitle.txt'), 'utf8')
					.toString()
			)
		} catch (err) {
			log(
				this,
				`Something went wrong when initiating ValClient. Fix it and try again. Automatically retrying ${err.message}`,
				'error'
			)
		}
	}

	async setPresence() {
		const presence = {
			message: `${this.prefix} help`,
			type: 'PLAYING'
		}

		log(this, `Current presence: ${presence.type} ${presence.message}`, 'info')

		this.user
			.setActivity(presence.message, { type: presence.type })
			.catch(err => log(this, err.message, 'error'))
	}

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	async initLoaders() {
		log(this, 'Loaders loading', 'info')

		for (const loader in Loaders) {
			new Loaders[loader](this).load()
		}

		log(this, 'All loaders loaded successfully', 'info')
	}

	/**
	 * Initialises client listeners. Doesn't handle exceptions on purpose.
	 */
	async initListeners() {
		log(this, 'Listeners loading', 'info')

		for (const listener in Listeners) {
			new Listeners[listener](this).init()
		}

		log(this, 'All listeners loaded successfully', 'info')
	}

	async initConfig() {
		try {
			if (this.controllers.mongo.ready && this.controllers.redis.ready) {
				const response = await this.controllers.mongo.db
					.collection('config')
					.findOne({
						GUILD_ID: process.env.GUILD_ID
					})

				if (!response)
					return log(
						this,
						`The bot is not setup. Commands won't work. Call ${this.prefix} setup`,
						'warn'
					)

				this.ready = true
				this.config = response || {}
			} else {
				this.controllers.queue.enqueue(this.initConfig)
			}
		} catch (err) {
			const message = `Something went wrong when initialising ConfigController, ${err.message}`

			log(this.client, message, 'error')
		}
	}
}

module.exports = ValClient
