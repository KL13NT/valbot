const { Controller } = require('../structures')
const { log } = require('../utils/utils')

class ReactionRolesController extends Controller {
	constructor (client){
		super(client, {
			name: 'ReactionRolesController'
		})
		this.ready = false
		this.responses = {}

		this.init = this.init.bind(this)

		this.init()
	}

	async init (){
		try{
			if(MongoController.ready){
				const responses = await MongoController.db.collection('reactionroles').find({})

				responses.forEach(({ invoker, reply }) => {
					this.responses[invoker] = {
						invoker,
						reply
					}
				})
			}
			else {
				QueueController.enqueue(this.init)
			}
		}
		catch(err){
			log(this.client, err, 'error')
		}
	}
}

module.exports = ReactionRolesController