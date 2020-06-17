const { CLIENT_ID } = process.env

const Discord = require('discord.js')

const { Controller } = require('../structures')
const { log, calculateUniqueWords, notify, getMemberObject, getRoleObject } = require('../utils/utils')



class SpamController extends Controller {
	constructor (client){
		super(client, {
			name: 'spam'
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
}

module.exports = SpamController