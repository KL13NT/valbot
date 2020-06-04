const { Controller } = require('../structures')
const { log } = require('../utils/utils')

class ConversationController extends Controller {
	constructor (client){
		super(client, {
			name: 'ConversationController'
		})
		this.ready = false
		this.responses = {}

		this.init = this.init.bind(this)


		this.init()
	}

	async init (){
		try{
			if(MongoController.ready){
				const responses = await MongoController.getResponses()

				responses.forEach(({ invoker, reply }) => {
					this.responses[invoker] = {
						invoker,
						reply
					}
				})

				log(this.client, 'Conversation controller loaded', 'info')
			}
			else {
				QueueController.enqueue(this.init)
			}
		}
		catch(err){
			const message = `Something went wrong when initialising ConversationController, ${err.message}`

			log(this.client, message, 'error')
		}
	}

	async converse (message, isClientMentioned){
		const response = Object
			.values(this.responses)
			.find(response => new RegExp(`${response.invoker}`, 'gi').test(message.content))

		if(response){
			message.reply(response.reply)
		}
		else if(isClientMentioned) message.reply('لو محتاجين مساعدة تقدروا تكتبوا `val! help`')
	}

	async teach (response){
		this.responses[response.invoker] = response
		return MongoController.saveResponse(response)
	}

	getAllResponses (){
		return this.responses
	}

}

module.exports = ConversationController