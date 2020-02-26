const { Client } = require(`discord.js`)
const { deepFreeze } = require(`./utils/utils`)

const fs = require(`fs`)
const path = require(`path`)
const Loaders = require(`./loaders`)
const Listeners = require(`./listeners`)
const ToxicityFilter = require(`./utils/InsultFiltering`)
const Logger = new (require(`./utils/Logger`))(path.resolve(__dirname, `../logs`))
const FileUtils = require(`./utils/FileUtils`)


/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

class ValClient extends Client {
	constructor (options = {}, prefix) {
		super(options)

		this.isLoggedin = false
		this.prefix = prefix || `val!`

		this.commands = {}
		this.warnedMembers = {}
		this.mutedMembers = {}

		this.IMPORTANT_CHANNELS = {
			notifications: `587571479173005312`,
			rules: `571718462179770369`,
			reports: `682069852738945149`
		}
		this.IMPORTANT_ROLES = {
			muted: `586839490102951936`
		}
		this.CUSTOM_PRESENCES = [
			{ message: `for val!`, type: `WAITING` },
			{ message: `something?`, type: `PLAYING` },
			{ message: `Dubstep`, type: `LISTENING` }
		]


		deepFreeze(this.IMPORTANT_CHANNELS)
		deepFreeze(this.IMPORTANT_ROLES)
		deepFreeze(this.CUSTOM_PRESENCES)

		this.mutedChecker()
	}

	/**
	 * The working interval for muted members
	 */
	async mutedChecker (){
		setInterval(() => {
			const newTime = new Date().getTime()

			for(const mutedId in this.mutedMembers){
				try{
					if(newTime - this.mutedMembers[mutedId].time >= 1000 * 60 * 15) {
						const guild = this.guilds.find(guild => guild.name === `VALARIUM`)

						if(guild.available){
							const member = guild.members.find(member => member.id === mutedId)

							if(member) {
								member.removeRole(this.IMPORTANT_ROLES.muted)
								delete this.mutedMembers[mutedId]

								this.notify(`<@${mutedId}> you have been unmuted. Enjoy your stay!`)

							}
						}
					}
				}
				catch(err){
					Logger.file(`info`, err)
				}
			}
		}, 1000 * 60) // every 1 minute
	}
	//TODO: check for muted and unmute after 15 mins

	/**
	 * Warns users automatically
	 * TODO: Replace it with Command Warn
   * @param message
   */
	async autoWarn (message){
		const { member } = message
		const { id } = member
		const warnings = this.warnedMembers[id]

		if(warnings){
			if(warnings == 2){

				message.reply(`you're getting muted for 15 minutes because of your toxic behaviour`)
				member.addRole(this.IMPORTANT_ROLES.muted)

				const muted = {
					time: new Date().getTime(),
					id: id
				}

				this.mutedMembers[id] = { ...muted }
				delete this.warnedMembers[id]
			}
			else this.warnedMembers[id] = warnings + 1
		}
		else this.warnedMembers[id] = 1
	}

	async init (token = process.env.AUTH_TOKEN) {

		try{
			this.initLoaders()
			this.initListeners()


			await super.login(token)

			this.setPresence()
			if(process.env.mode !== `DEVELOPMENT`) this.ToxicityFilter = await new ToxicityFilter(0.8)

			console.log(fs.readFileSync(path.resolve(__dirname, `../text/bigtitle.txt`), `utf8`).toString(), `Loaded successfully`)

		}
		catch(err){
			console.log(`Something went wrong when initiating ValClient. Fix it and try again.`, err)
			process.exit()
		}

	}

	async setPresence (){
		const { CUSTOM_PRESENCES, user } = this

		setInterval(() => {

			const randomPresence = CUSTOM_PRESENCES[Math.floor(Math.random() * CUSTOM_PRESENCES.length)]
			user.setActivity(randomPresence.message, { type: randomPresence.type })

			console.log(`Current presence: ${randomPresence.type} ${randomPresence.message}`)

		}, 10 * 60 * 1000)
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

	async notify (message){
		this.guilds.find(guild => guild.name === `VALARIUM`)
			.channels.find(ch => ch.id === this.IMPORTANT_CHANNELS.notifications)
			.send(message)
	}

}

Object.defineProperty(ValClient, `constant1`, {
	value: 33,
	writable : false,
	enumerable : true,
	configurable : false
})


module.exports = ValClient