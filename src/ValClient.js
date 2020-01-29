const { Client } = require(`discord.js`)

const fs = require(`fs`)
const path = require(`path`)
const Loaders = require(`./loaders`)
const Listeners = require(`./listeners`)
const Logger = new (require(`./utils/Logger`))(__dirname, `../logs`)
const ToxicityFilter = require(`./utils/InsultFiltering`)


/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

class ValClient extends Client {
	constructor (options = {}, prefix) {
		super(options)
		this.isLoggedin = false
		this.prefix = prefix || `val!`
		this.importantChannels = {
			notifications: `587571479173005312`
		}
		this.commands = {}
		this.customPresences = [
			{ message: `for val!`, type: `WAITING` },
			{ message: `something?`, type: `PLAYING` },
			{ message: `Dubstep`, type: `LISTENING` }
		]
		this.warnedMembers = {}
		this.mutedMembers = {}

		this.mutedChecker()
		this.importantRoles = {
			muted: `586839490102951936`
		}
	}

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
								member.removeRole(this.importantRoles.muted)
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
   * @param message
   */
	async autoWarn (message){
		const { member } = message
		const { id } = member
		const warnings = this.warnedMembers[id]
    
		if(warnings){
			if(warnings == 2){
				message.reply(`you're getting muted for 15 minutes because of your toxic behaviour`)
				member.addRole(this.importantRoles.muted)
        
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
		try {
			this.ToxicityFilter = new ToxicityFilter(0.8)

			this.CLILogo = fs.readFileSync(path.resolve(__dirname, `../text/bigtitle.txt`), `utf8`).toString()

			this.initLoaders()
			await super.login(token)
		}
		catch(err){
			Logger.file(`error`, `Error while client logging in. ${err.message}, ${JSON.stringify(err.stack)}`)
		}
	}

	async setPresence (){
		const { customPresences, user } = this
		console.log(this.user)
		setInterval(() => {
      
			const randomPresence = customPresences[Math.floor(Math.random() * customPresences.length)]
			user.setActivity(randomPresence.message, { type: randomPresence.type })
      
			console.log(`Current presence: ${randomPresence.type} ${randomPresence.message}`)
      
		}, 10 * 60 * 1000)
	}

	async runCommand (command, context, args){}

	async initLoaders () {
		//Load loaders from file
		for (const loader in Loaders) {
			try {
				const currentLoader = new Loaders[loader](this)
				await currentLoader.load()
			} catch (err) {
				console.log(err)
			} 
		}
	}

	async initListeners (){
		for (const listener in Listeners) {
			try {
				new Listeners[listener](this)
			} catch (err) {
				console.log(err)
			} 
		}
	}

	async notify (message){
		this.guilds.find(guild => guild.name === `VALARIUM`)
			.channels.find(ch => ch.id === this.importantChannels.notifications)
			.send(message)
	}
}

module.exports = ValClient