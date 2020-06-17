const { Controller } = require('../structures')
const { log } = require('../utils/utils')

class ReactionRolesController extends Controller {
	constructor (client){
		super(client, {
			name: 'reactionroles'
		})
		this.ready = false
		this.responses = {}

		this.init = this.init.bind(this)

		this.init()
	}

	async init (){
		try{
			if(this.client.controllers.mongo.ready){
				const responses = await this.client.controllers.mongo.db.collection('reactionroles').find({})

				responses.forEach(({ invoker, reply }) => {
					this.responses[invoker] = {
						invoker,
						reply
					}
				})
			}
			else {
				this.client.controllers.queue.enqueue(this.init)
			}
		}
		catch(err){
			log(this.client, err, 'error')
		}
	}
}

module.exports = ReactionRolesController