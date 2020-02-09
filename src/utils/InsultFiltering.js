const toxicity = require(`@tensorflow-models/toxicity`)
const { insults } = require(`./arabic-insults.json`)


// Load the model. Users optionally pass in a threshold and an array of
// labels to include.
class ToxicityLoader {
	constructor (threshold){
		this.labels = [
			`identity_attack`,
			`severe_toxicity`,
			`threat`,
			`insult`,
			`obscene`,
			`sexual_explicit`,
			`toxicity`
		]

		this.arInsultsRegex = new RegExp(insults)
		this.ready = false

		toxicity.load(threshold).then(model => {
			this.classifier = model
			this.ready = true

			console.log(`Toxicity Classifier has been loaded`)
		})
	}

	async classify (sentence){
		const predictions = await this.classifier.classify([ sentence ])

		// if(this.arInsultsRegex.test(sentence)) return true


		for(const curr of predictions){
			console.log(curr.results[0].probabilities[1])
			if(curr.results[0].match === true && curr.results[0].probabilities[1] > 0.92) return true
		}

		return false
	}
}

module.exports = ToxicityLoader