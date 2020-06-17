const { CLIENT_ID } = process.env

const Discord = require('discord.js')

const { Controller, Level } = require('../structures')
const { log, calculateUniqueWords, notify, getMemberObject, getRoleObject } = require('../utils/utils')



class LevelsController extends Controller {
	constructor (client){
		super(client, {
			name: 'levels'
		})

		this.message = this.message.bind(this)
		this.voiceIncrement = this.voiceIncrement.bind(this)
		this.levelUpMessage = this.levelUpMessage.bind(this)
		this.levelUp = this.levelUp.bind(this)
		this.trackUser = this.trackUser.bind(this)
		this.untrackUser = this.untrackUser.bind(this)
		this.initUser = this.initUser.bind(this)
		this.addMilestone = this.addMilestone.bind(this)
		this.removeMilestone = this.removeMilestone.bind(this)
		this.enforceMilestone = this.enforceMilestone.bind(this)

		this.init = this.init.bind(this)
		this.activeVoice = []
		this.milestones = {}

		this.init()
	}

	async init (){
		//REFACTORME: SPLIT THIS MESS INTO SINGLE-PURPOSE FUNCTIONS YA BELLEND
		if(this.client.controllers.mongo.ready && this.client.controllers.redis.ready && this.client.ValGuild.available){
			const voiceStates = Array.from(this.client.ValGuild.voiceStates.cache.values())

			voiceStates.forEach(({ deaf, mute, member, channel }) => {
				if(channel.id !== '571721579214667786' && !member.user.bot && !deaf && !mute){
					this.activeVoice.push(member.id)
				}
			})

			this.client.controllers.mongo.getLevels().then(async levels => {
				levels.forEach(({ id, text, voice, level, textXP, voiceXP }) => {
					this.client.controllers.redis.set(`TEXT:${id}`, (Number(text) || 1))
					this.client.controllers.redis.set(`TEXT:XP:${id}`, (Number(textXP) || 1))
					this.client.controllers.redis.set(`VOICE:${id}`, (Number(voice) || 1))
					this.client.controllers.redis.set(`VOICE:XP:${id}`, (Number(voiceXP) || 1))
					this.client.controllers.redis.set(`LEVEL:${id}`, (Number(level) || 1))
				})

				this.client.controllers.intervals.setInterval(
					1000 * 60,
					{ name: 'voiceIncrement' },
					this.voiceIncrement
				)
			})

			this.client.controllers.mongo.getMilestones().then(found => {
				found.forEach(level => {
					this.milestones[level.level] = level.milestones
				})
			})
		}
		else this.client.controllers.queue.enqueue(this.init)
	}
	/**
	 *
	 * @param {Message} message
	 */
	async message (message) {
		const { author, content } = message
		const { id, bot } = author

		if(id === CLIENT_ID || bot) return

		try{
			const textXP = Number(await this.client.controllers.redis.get(`TEXT:XP:${id}`))
			const text = Number(await this.client.controllers.redis.get(`TEXT:${id}`))

			const level = Number(await this.client.controllers.redis.get(`LEVEL:${id}`))
			const exp = Number(await this.client.controllers.redis.get(`EXP:${id}`))

			const gainedWords = Math.ceil(calculateUniqueWords(content) * 0.4)

			if(exp){
				const nextText = Math.floor(((textXP + gainedWords) / 6) - 60)
				const textIncrBy = nextText - text <= 0? 1: nextText - text

				const nextLevel = Math.floor(((exp + gainedWords) / 6) - 60)
				const levelIncrBy = nextLevel - level <= 0? 1: nextLevel - level

				if(exp + gainedWords >= ((60 * Number(level) * 0.1) + 60)){

					this.client.controllers.redis.incrby(`LEVEL:${id}`, levelIncrBy)
					this.client.controllers.redis.set(`EXP:${id}`, 1)

					this.levelUp(message)
				}

				if(textXP + gainedWords >= ((60 * Number(text) * 0.1) + 60)) {
					this.client.controllers.redis.incrby(`TEXT:${id}`, textIncrBy)
					this.client.controllers.redis.set(`TEXT:EXP:${id}`, 1)
				}
				else {
					this.client.controllers.redis.incrby(`EXP:${id}`, gainedWords)
					this.client.controllers.redis.incrby(`TEXT:XP:${id}`, gainedWords)
				}
			}

			else this.initUser(id)

		}
		catch(err){
			log(this.client, err, 'error')
		}
		// message.reply('Hello')

		/**
		 * The way this algorithm will work
		 * It'll take a message and extract needed data from it
		 * It'll then check currently available ValClient.levels for the user
		 * 	If user is found it'll increment
		 * 		If user is at a point where they should level up
		 * 			Reply to their message and increase their level
		 *  If user is not found
		 * 		A DB query creates a new document and loads it locally
		 *
		 * All of this needs a listener for messages
		 * This will utilise MessageListener with an added condition
		 * and will apply needed logic
		 */

		/**
		 * The way the voice algorithm will work
		 * Users join and leave voice channels
		 * On user join event
		 * 	Add user to currently active users (lcoal)
		 * 	If user is found it'll increment
		 * 		If user is at a point where they should level up
		 * 			Reply to their message and increase their level
		 *  If user is not found
		 * 		A DB query creates a new document and loads it locally
		 *
		 * All of this needs a listener for voice
		 * A new VoiceListener will be created that will report
		 * whenever a user joins or leaves voice chat
		 */

		/**
			* Implementation notes
			* The database doesn't need to know about actual activity
			* And should only be used to store
			* Perhaps a key-value (this.client.controllers.redis?) store should be used for local operations
			* And then flushed to the mongo instance
			*/
	}

	async voiceIncrement (){
		this.activeVoice.forEach(async id => {
			try{


				const voiceXP = Number(await this.client.controllers.redis.get(`VOICE:XP:${id}`))
				const voice = Number(await this.client.controllers.redis.get(`VOICE:${id}`))

				const level = Number(await this.client.controllers.redis.get(`LEVEL:${id}`))
				const exp = Number(await this.client.controllers.redis.get(`EXP:${id}`))

				const XP_PER_MINUTE = 4

				if(exp){
					const nextVoice = Math.floor(((voiceXP + XP_PER_MINUTE) / 6) - 60)
					const voiceIncrBy = nextVoice - voice <= 0? 1: nextVoice - voice

					const nextLevel = Math.floor(((exp + XP_PER_MINUTE) / 6) - 60)
					const levelIncrBy = nextLevel - voice <= 0? 1: nextLevel - voice

					if(exp + XP_PER_MINUTE >= ((60 * Number(level) * 0.1) + 60)){
						this.client.controllers.redis.incrby(`LEVEL:${id}`, levelIncrBy)
						this.client.controllers.redis.set(`EXP:${id}`, 1)

						this.levelUp(id)
					}

					if(voiceXP + XP_PER_MINUTE >= ((60 * Number(voice) * 0.1) + 60)) {
						this.client.controllers.redis.incrby(`VOICE:${id}`, voiceIncrBy)
						this.client.controllers.redis.set(`VOICE:XP:${id}`, 1)

					}
					else {
						this.client.controllers.redis.incrby(`EXP:${id}`, XP_PER_MINUTE)
						this.client.controllers.redis.incrby(`VOICE:XP:${id}`, XP_PER_MINUTE)
					}
				}
				else this.initUser(id)

			}
			catch(err){
				log(this.client, err, 'error')
			}
		})
	}

	async initUser (id){
		this.client.controllers.redis.set(`EXP:${id}`, 1)
		this.client.controllers.redis.set(`LEVEL:${id}`, 1)
		this.client.controllers.redis.set(`TEXT:XP:${id}`, 1)
		this.client.controllers.redis.set(`TEXT:${id}`, 1)
		this.client.controllers.redis.set(`VOICE:XP:${id}`, 1)
		this.client.controllers.redis.set(`VOICE:${id}`, 1)

		this.levelUp(id)
	}

	trackUser (id){
		const index = this.activeVoice.indexOf(id)

		if(index === -1) this.activeVoice.push(id)
	}

	untrackUser (id){
		const index = this.activeVoice.indexOf(id)

		if(index !== -1) this.activeVoice.splice(index, 1)
	}

	async levelUp (messageOrId){
		const id = typeof messageOrId === 'string'? messageOrId: messageOrId.member.user.id

		const exp = Number(await this.client.controllers.redis.get(`EXP:${id}`))
		const level = Number(await this.client.controllers.redis.get(`LEVEL:${id}`))

		const voiceXP = Number(await this.client.controllers.redis.get(`VOICE:XP:${id}`))
		const voice = Number(await this.client.controllers.redis.get(`VOICE:${id}`))

		const textXP = Number(await this.client.controllers.redis.get(`TEXT:XP:${id}`))
		const text = Number(await this.client.controllers.redis.get(`TEXT:${id}`))

		this.client.controllers.mongo.syncLevels(id, { exp, text, voice, level, textXP, voiceXP })

		this.enforceMilestone(level, id)
		this.levelUpMessage(id, level)
	}

	async enforceMilestone (userLevel, id){
		const level = this.milestones[userLevel]

		if(level){
			const member = getMemberObject(this.client, id)

			level.forEach(async milestone => {
				try{
					const role = getRoleObject(this.client, milestone.roleID)


					const embed = new Discord.MessageEmbed()
						.setColor('#ffcc5c')
						.setTitle(`Achievement Unlocked - ${milestone.name}`)
						.setDescription(`GG! You unlocked the ${milestone.name} achievement\nYou just received the ${role.name} role!`)
						.addFields(
							{ name: 'Achievement name', value: milestone.name },
							{ name: 'Achievement description', value: milestone.description }
						)
						.setTimestamp()
						.setFooter('To get all available milestones ask an admin')

					member.roles.add(milestone.roleID)
					notify(this.client, `<@${id}>`, embed)
				}
				catch(err){
					log(this.client, err, 'error')
				}
			})
		}
	}

	async levelUpMessage (id, level){
		const notification = `GG <@${id}>, you just advanced to level ${level}! :fireworks: <:PutinWaves:668209208113627136>`

		notify(this.client, notification)
	}

	addMilestone (level, name, description,  roleID){
		const milestone = this.milestones[level]
		const newMilestone = {
			name,
			roleID,
			description
		}

		if(milestone){
			if(milestone.find(mile => mile.roleID === roleID || mile.name === name)) return
			else {
				milestone.push(newMilestone)
			}
		}
		else {
			this.milestones[level] = [ newMilestone ]
		}

		this.client.controllers.mongo.db.collection('milestones').updateOne(
			{
				level
			},
			{
				$push: { milestones: newMilestone }
			}, {
				upsert: true
			})
	}

	getMilestone (level){
		return this.milestones[level]
	}

	async removeMilestone (level, name){
		const milestone = this.milestones[level]

		if(milestone){
			const ach = milestone.findIndex(ach => ach.name === name)

			delete this.milestones[level][ach]

			if(Object.keys(this.milestones[level]).length === 0) {
				delete this.milestones[level]
				this.client.controllers.mongo.db.collection('milestones').deleteOne({ level })
			}

			else this.client.controllers.mongo.db
				.collection('milestones')
				.updateOne({
					level
				}, {
					$pull: { milestones : { name: name } }
				})
		}
	}
}

module.exports = LevelsController