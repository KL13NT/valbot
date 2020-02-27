const toxicity = require('@tensorflow-models/toxicity')
const { NOTIFY_UNMUTED, WARN_BAD_LANGUAGE } = require('../config/events.json')
const { notify } = require('./utils')


// Load the model. Users optionally pass in a threshold and an array of
// labels to include.
class ToxicityLoader {
	constructor (threshold){
		this.labels = [
			'identity_attack',
			'severe_toxicity',
			'threat',
			'insult',
			'obscene',
			'sexual_explicit',
			'toxicity'
		]

		this.isReady = false

		toxicity.load(threshold).then(model => {
			this.classifier = model
			this.isReady = true

			console.log('Toxicity Classifier has been loaded')
		})
	}

	async classifyAndWarn (message){
		const { content: sentence } = message
		const predictions = await this.classifier.classify([ sentence ])

		for(const curr of predictions){
			if(curr.results[0].match === true && curr.results[0].probabilities[1] > 0.90) return this.warn(message)
		}

		return false
	}

	/**
	 * Warns users automatically
	 * TODO: Replace it with Command Warn
   * @param message
   */
	async warn (message){
		const { member } = message
		const { id } = member
		const { IMPORTANT_ROLES, IMPORTANT_CHANNELS } = process
		const warnings = process.WARNED_MEMBERS[id]

		if(warnings){
			if(warnings == 2){

				message.reply(WARN_BAD_LANGUAGE)
				message.delete()


				delete process.WARNED_MEMBERS[id]
			}

			else process.WARNED_MEMBERS[id] = warnings + 1
		}

		else process.WARNED_MEMBERS[id] = 1
	}


	/**
	 * The working interval for muted members
	 */
	async mutedChecker (){
		setInterval(() => {
			const { IMPORTANT_ROLES } = process
			const newTime = new Date().getTime()

			for(const mutedId in process.mutedMembers){
				try{
					if(newTime - this.mutedMembers[mutedId].time >= 1000 * 60 * 15) {
						const guild = this.guilds.find(guild => guild.name === 'VALARIUM')

						if(guild.available){
							const member = guild.members.find(member => member.id === mutedId)

							if(member) {
								member.removeRole(IMPORTANT_ROLES.muted)
								delete this.mutedMembers[mutedId]

								notify(`<@${mutedId}> ${NOTIFY_UNMUTED}`)

							}
						}
					}
				}
				catch(err){
					// Logger.file('info', err)
				}
			}
		}, 1000 * 60) // every 1 minute
	}
}

module.exports = ToxicityLoader