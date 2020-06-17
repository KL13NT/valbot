const toxicity = require('@tensorflow-models/toxicity')

const { NOTIFY_UNMUTED, WARN_BAD_LANGUAGE } = require('../config/events.json')
const { notify, log } = require('../utils/utils')
const { Controller } = require('../structures')

class ToxicityController extends Controller {
	constructor(client) {
		super(client, {
			name: 'toxicity'
		})

		this.labels = [
			'identity_attack',
			'severe_toxicity',
			'threat',
			'insult',
			'obscene',
			'sexual_explicit',
			'toxicity'
		]

		this.threshold = 0.8
		this.ready = false

		if (process.env.mode !== 'DEVELOPMENT')
			toxicity.load(this.threshold, this.labels).then(model => {
				this.classifier = model
				this.ready = true

				log(client, 'ToxicityController loaded successfully', 'info')
			})

		this.classify = this.classify.bind(this)
	}

	async classify(message) {
		if (process.env.mode === 'DEVELOPMENT' || !this.ready) return false

		const { content: sentence } = message
		const predictions = await this.classifier.classify([ sentence ])

		return predictions.reduce((prediction, curr) =>
			curr.results[0].match === true && curr.results[0].probabilities[1] > 0.9
				? true
				: prediction
		)
	}

	/**
	 * The working interval for muted members
	 */
	async mutedChecker() {
		setInterval(() => {
			const { IMPORTANT_ROLES } = process
			const newTime = new Date().getTime()

			for (const mutedId in process.mutedMembers) {
				try {
					if (newTime - this.mutedMembers[mutedId].time >= 1000 * 60 * 15) {
						const guild = this.guilds.find(guild => guild.name === 'VALARIUM')

						if (guild.available) {
							const member = guild.members.find(member => member.id === mutedId)

							if (member) {
								member.removeRole(IMPORTANT_ROLES.muted)
								delete this.mutedMembers[mutedId]

								notify(`<@${mutedId}> ${NOTIFY_UNMUTED}`)
							}
						}
					}
				} catch (err) {
					// Logger.file('info', err)
				}
			}
		}, 1000 * 60) // every 1 minute
	}
}

module.exports = ToxicityController
