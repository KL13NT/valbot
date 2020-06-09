const { Client } = require('discord.js')

const fs = require('fs')
const path = require('path')
const Loaders = require('./loaders')
const Listeners = require('./listeners')
const ToxicityFilter = require('./utils/InsultFiltering')

const { log } = require('./utils/utils')


/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

class ValClient extends Client {
	constructor (options = {}, prefix) {
		super(options)

		this.ready = false
		this.prefix = prefix || process.env.MODE === 'DEVELOPMENT'? 'vd!': 'v!'
		this.commands = {}
		this.controllers = {}

		this.ValGuild = {}

		this.setPresence = this.setPresence.bind(this)
	}

	async init (token = process.env.AUTH_TOKEN, retry = 0) {
		try{
			this.setupConfig()
			this.login(token)


			this.ToxicityFilter = new ToxicityFilter(0.8)
			await this.initLoaders()
			await this.initListeners()


			console.log(fs.readFileSync(path.resolve(__dirname, './text/bigtitle.txt'), 'utf8').toString())

		}
		catch(err){
			log(this, `Something went wrong when initiating ValClient. Fix it and try again. Automatically retrying ${err.message}`, 'error')

			if(retry === 5) {
				process.exit(1)
			}

			return this.init(token, ++retry)
		}

	}

	async setPresence (){
		const { CUSTOM_PRESENCES: customPresences } = this.config
		const { user } = this

		function setCurrentPresence (){
			const randomIndex = Math.floor(Math.random() * customPresences.length)
			const randomPresence = customPresences[randomIndex]
			user.setActivity(randomPresence.message, { type: randomPresence.type }).catch(err => console.log(err))

			log(this, `Current presence: ${randomPresence.type} ${randomPresence.message}`, 'info')
		}

		setCurrentPresence.apply(this)
		setInterval(setCurrentPresence, 10 * 60 * 1000)
	}

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	async initLoaders () {
		log(this, 'Loaders loading', 'info')

		for (const loader in Loaders) {
			new Loaders[loader](this).load()
		}

		log(this, 'All loaders loaded successfully', 'info')
	}

	/**
	 * Initialises client listeners. Doesn't handle exceptions on purpose.
	 */
	async initListeners (){
		log(this, 'Listeners loading', 'info')

		for (const listener in Listeners) {
			new Listeners[listener](this).init()
		}

		log(this, 'All listeners loaded successfully', 'info')
	}


	/**
	 * Loads configuration/global objects instead of storing them on ValClient
	 */
	setupConfig (){
		const config = {
			CUSTOM_PRESENCES: require('./config/custom-presences.json'),
			IMPORTANT_CHANNELS_ID: require('./config/important-channels.json'),
			IMPORTANT_ROLES: require('./config/important-roles.json'),
			MUTED_MEMBERS: {},
			WARNED_MEMBERS: {},
			IMPORTANT_CHANNELS: {}
		}

		this.config = config
	}

}

module.exports = ValClient