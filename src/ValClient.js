const { Client } = require('discord.js')
const { setupConfig } = require('./utils/utils')

const fs = require('fs')
const path = require('path')
const Loaders = require('./loaders')
const Listeners = require('./listeners')
const ToxicityFilter = require('./utils/InsultFiltering')



/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

class ValClient extends Client {
	constructor (options = {}, prefix) {
		super(options)

		this.isLoggedin = false
		this.prefix = prefix || 'val!'

		this.commands = {}

	}

	async init (token = process.env.AUTH_TOKEN) {

		try{
			await super.login(token)

			setupConfig()
			this.initLoaders()
			this.initListeners()
			this.setPresence()

			if(process.env.mode !== 'DEVELOPMENT') this.ToxicityFilter = await new ToxicityFilter(0.8)

			console.log(fs.readFileSync(path.resolve(__dirname, './text/bigtitle.txt'), 'utf8').toString(), 'Loaded successfully')

		}
		catch(err){
			console.log('Something went wrong when initiating ValClient. Fix it and try again.', err)
			process.exit()
		}

	}

	async setPresence (){
		const { CUSTOM_PRESENCES } = process
		const { user } = this

		function setCurrentPresence (){
			const randomPresence = CUSTOM_PRESENCES[Math.floor(Math.random() * CUSTOM_PRESENCES.length)]
			user.setActivity(randomPresence.message, { type: randomPresence.type })

			console.log(`Current presence: ${randomPresence.type} ${randomPresence.message}`)
		}

		setCurrentPresence()
		setInterval(setCurrentPresence, 10 * 60 * 1000)
	}

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	initLoaders () {
		//Load loaders from file
		for (const loader in Loaders) {
			new Loaders[loader](this).load()
		}
	}

	/**
	 * Initialises client listeners. Doesn't handle exceptions on purpose.
	 */
	initListeners (){
		for (const listener in Listeners) {
			new Listeners[listener](this).init()
		}
	}

}

module.exports = ValClient