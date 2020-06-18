const toxicity = require('@tensorflow-models/toxicity')

const { Controller } = require('../structures')
const { warn, mute, isWarned } = require('../utils/ModerationUtils')
const { log } = require('../utils/utils')

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
		this.handleToxic = this.handleToxic.bind(this)
	}

	async classify(message) {
		if (process.env.mode === 'DEVELOPMENT' || !this.ready) return false

		const { content: sentence } = message
		const predictions = await this.classifier.classify([sentence])

		return predictions.reduce((prediction, curr) =>
			curr.results[0].match === true && curr.results[0].probabilities[1] > 0.9
				? true
				: prediction
		)
	}

	async handleToxic(message) {
		const { CLIENT_ID } = process.env
		const { author, channel } = message
		const reason = 'Used toxic language'

		if (isWarned(this.client, author.id)) {
			await message.reply('دي تاني مرة تقل ادبك. ادي اخرتها. mute.')
			await mute(this.client, {
				member: author.id,
				moderator: CLIENT_ID,
				channel: channel.id,
				reason
			})

			message.delete({ reason })
		} else {
			await message.reply('متبقوش توكسيك. ده تحذير, المره الجاية mute.')
			await warn(this.client, {
				member: author.id,
				moderator: CLIENT_ID,
				channel: channel.id,
				reason
			})

			message.delete({ reason })
		}
	}
}

module.exports = ToxicityController
