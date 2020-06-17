const { CLIENT_ID } = process.env

const Discord = require('discord.js')

const { Controller } = require('../structures')
const { log, calculateUniqueWords, notify, getMemberObject, getRoleObject } = require('../utils/utils')



class SpamController extends Controller {
	constructor (client){
		super(client, {
			name: 'SpamController'
		})

		this.isSpam = this.isSpam.bind(this)

		this.init = this.init.bind(this)
		this.init()

		this.cache = {
			
		}
	}

	isSpam (message){

	}

	async init (){
		//REFACTORME: SPLIT THIS MESS INTO SINGLE-PURPOSE FUNCTIONS YA BELLEND
		if(MongoController.ready && RedisController.ready && this.client.ValGuild.available){
			const voiceStates = Array.from(this.client.ValGuild.voiceStates.cache.values())

			voiceStates.forEach(({ deaf, mute, member, channel }) => {
				if(channel.id !== '571721579214667786' && !member.user.bot && !deaf && !mute){
					this.activeVoice.push(member.id)
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
}

module.exports = SpamController