const { CLIENT_ID } = process.env

const Discord = require('discord.js')

const { Controller, Level } = require('../structures')
const { log, calculateUniqueWords, notify, getMemberObject, getRoleObject } = require('../utils/utils')



class LevelsController extends Controller {
	constructor (client){
		super(client, {
			name: 'LevelsController'
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
		/**
		 * 12: [
				{
					roleID: '712589843909312582',
					name: 'achievement name',
					description: 'ausiodasod iaosjd ioasd jasiodj aiosjd o'
				},
				{
					roleID: '712589843909312582',
					name: 'achievement name',
					description: 'ausiodasod iaosjd ioasd jasiodj aiosjd o'
				}
			]
		 */

		this.init()
	}

	async init (){
		if(MongoController.ready && RedisController.ready && this.client.ValGuild.available){
			const voiceStates = Array.from(this.client.ValGuild.voiceStates.cache.values())

			voiceStates.forEach(state => {
				if(!state.deaf && !state.mute){
					this.activeVoice.push(state.id)
				}
			})

			MongoController.getLevels().then(async levels => {
				levels.forEach(({ id, text, voice, level, textXP, voiceXP }) => {
					RedisController.set(`TEXT:${id}`, (Number(text) || 1))
					RedisController.set(`TEXT:XP:${id}`, (Number(textXP) || 1))
					RedisController.set(`VOICE:${id}`, (Number(voice) || 1))
					RedisController.set(`VOICE:XP:${id}`, (Number(voiceXP) || 1))
					RedisController.set(`LEVEL:${id}`, (Number(level) || 1))
				})

				IntervalsController.setInterval(
					1000 * 60,
					{ name: 'voiceIncrement' },
					this.voiceIncrement
				)
			})

			MongoController.getMilestones().then(found => {
				found.forEach(level => {
					this.milestones[level.level] = level.milestones
				})
			})
		}
		else QueueController.enqueue(this.init)
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
			const textXP = Number(await RedisController.get(`TEXT:XP:${id}`))
			const text = Number(await RedisController.get(`TEXT:${id}`))

			const level = Number(await RedisController.get(`LEVEL:${id}`))
			const exp = Number(await RedisController.get(`EXP:${id}`))

			const gainedWords = calculateUniqueWords(content)

			if(exp){
				const nextText = Math.floor(((textXP + gainedWords) / 6) - 60)
				const textIncrBy = nextText - text <= 0? 1: nextText - text

				const nextLevel = Math.floor(((exp + gainedWords) / 6) - 60)
				const levelIncrBy = nextLevel - level <= 0? 1: nextLevel - level

				if(exp + gainedWords >= ((60 * Number(level) * 0.1) + 60)){

					RedisController.incrby(`LEVEL:${id}`, levelIncrBy)
					RedisController.set(`EXP:${id}`, 1)

					this.levelUp(message)
				}

				if(textXP + gainedWords >= ((60 * Number(text) * 0.1) + 60)) {
					RedisController.incrby(`TEXT:${id}`, textIncrBy)
					RedisController.set(`TEXT:EXP:${id}`, 1)
				}
				else {
					RedisController.incrby(`EXP:${id}`, gainedWords)
					RedisController.incrby(`TEXT:XP:${id}`, gainedWords)
				}
			}

			else this.initUser(id)

		}
		catch(err){
			log(this.client, err.message, 'error')
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
			* Perhaps a key-value (RedisController?) store should be used for local operations
			* And then flushed to the mongo instance
			*/
	}

	async voiceIncrement (){
		this.activeVoice.forEach(async id => {
			try{
				const voiceXP = Number(await RedisController.get(`VOICE:XP:${id}`))
				const voice = Number(await RedisController.get(`VOICE:${id}`))

				const level = Number(await RedisController.get(`LEVEL:${id}`))
				const exp = Number(await RedisController.get(`EXP:${id}`))

				const XP_PER_MINUTE = 1

				if(exp){
					const nextVoice = Math.floor(((voiceXP + XP_PER_MINUTE) / 6) - 60)
					const voiceIncrBy = nextVoice - voice <= 0? 1: nextVoice - voice

					const nextLevel = Math.floor(((exp + XP_PER_MINUTE) / 6) - 60)
					const levelIncrBy = nextLevel - voice <= 0? 1: nextLevel - voice

					if(exp + XP_PER_MINUTE >= ((60 * Number(level) * 0.1) + 60)){
						RedisController.incrby(`LEVEL:${id}`, levelIncrBy)
						RedisController.set(`EXP:${id}`, 1)

						this.levelUp(id)
					}

					if(voiceXP + XP_PER_MINUTE >= ((60 * Number(voice) * 0.1) + 60)) {
						RedisController.incrby(`VOICE:${id}`, voiceIncrBy)
						RedisController.set(`VOICE:XP:${id}`, 1)

					}
					else {
						RedisController.incrby(`EXP:${id}`, 1)
						RedisController.incrby(`VOICE:XP:${id}`, 1)
					}
				}
				else this.initUser(id)

			}
			catch(err){
				log(this.client, err.message, 'error')
			}
		})
	}

	async initUser (id){
		RedisController.set(`EXP:${id}`, 1)
		RedisController.set(`LEVEL:${id}`, 1)
		RedisController.set(`TEXT:XP:${id}`, 1)
		RedisController.set(`TEXT:${id}`, 1)
		RedisController.set(`VOICE:XP:${id}`, 1)
		RedisController.set(`VOICE:${id}`, 1)

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

		const exp = Number(await RedisController.get(`EXP:${id}`))
		const level = Number(await RedisController.get(`LEVEL:${id}`))

		const voiceXP = Number(await RedisController.get(`VOICE:XP:${id}`))
		const voice = Number(await RedisController.get(`VOICE:${id}`))

		const textXP = Number(await RedisController.get(`TEXT:XP:${id}`))
		const text = Number(await RedisController.get(`TEXT:${id}`))

		MongoController.syncLevels(id, { exp, text, voice, level, textXP, voiceXP })

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
					log(this.client, err.message, 'error')
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

		MongoController.db.collection('milestones').updateOne(
			{
				level
			},
			{
				$push: { milestones: newMilestone }
			}, {
				upsert: true
			})
	}

	getMilestone (level, roleID, name){
		const milestone = this.milestones[level]

		if(milestone) return milestone.find(m => m.roleID === roleID && m.name === name)
		else return milestone
	}


	async removeMilestone (level, name){
		const milestone = this.milestones[level]

		if(milestone){
			const ach = milestone.findIndex(ach => ach.name === name)

			delete this.milestones[level][ach]

			MongoController.db
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