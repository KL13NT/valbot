const { Client } = require('discord.js')

const fs = require('fs')
const path = require('path')
const Loaders = require('./loaders')
const Listeners = require('./listeners')
const ToxicityFilter = require('./utils/InsultFiltering')
const { Queue } = require('./structures')
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
		this.queue = new Queue()

	}

	async init (token = process.env.AUTH_TOKEN, retry = 0) {
		try{
			this.setupConfig()
			this.login(token)
			await this.initLoaders()
			await this.initListeners()

			this.ToxicityFilter = new ToxicityFilter(0.8)

			console.log(fs.readFileSync(path.resolve(__dirname, './text/bigtitle.txt'), 'utf8').toString(), 'Loaded successfully')

		}
		catch(err){
			console.log('Something went wrong when initiating ValClient. Fix it and try again. Automatically retrying', err)

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

			console.log(`Current presence: ${randomPresence.type} ${randomPresence.message}`)
		}

		setCurrentPresence()
		setInterval(setCurrentPresence, 10 * 60 * 1000)
	}

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	async initLoaders () {
		//Load loaders from file
		for (const loader in Loaders) {
			new Loaders[loader](this).load()
		}

		log(this, 'All loaders completed successfully', 'info')
	}

	/**
	 * Initialises client listeners. Doesn't handle exceptions on purpose.
	 */
	async initListeners (){
		for (const listener in Listeners) {
			new Listeners[listener](this).init()
		}

		console.log('\nlisteners ready\n')
	}


	/**
	 * Loads configuration/global objects instead of storing them on ValClient
	 */
	setupConfig (){
		const config = {
			CUSTOM_PRESENCES: require('./config/custom-presences.json'),
			IMPORTANT_CHANNELS_ID: require('./config/important-channels.json'),
			IMPORTANT_ROLES: require('./config/important-roles.json'),
			AUTH_LEVELS: require('./config/auth-levels.json'),
			MUTED_MEMBERS: {},
			WARNED_MEMBERS: {},
			IMPORTANT_CHANNELS: {}
		}

		this.config = config
	}

}

module.exports = ValClient