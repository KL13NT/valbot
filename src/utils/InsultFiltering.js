const toxicity = require(`@tensorflow-models/toxicity`)



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
    this.ready = false
    
    toxicity.load(threshold).then(model => {
      this.classifier = model
      this.ready = true

      console.log(`Toxicity Classifier has been loaded`)
    })
  }
  
  async classify (sentence){
    const predictions = await this.classifier.classify([ sentence ])

    for(const curr of predictions){
      if(curr.results[0].match === true) return true
    }

    return false
  }
}

module.exports = ToxicityLoader