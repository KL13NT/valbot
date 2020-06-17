const { Controller } = require('../structures')
const { log } = require('../utils/utils')

class ConversationController extends Controller {
	constructor (client){
		super(client, {
			name: 'conversation'
		})
		this.ready = false
		this.responses = {}

		this.init = this.init.bind(this)
		this.converse = this.converse.bind(this)
		this.teach = this.teach.bind(this)
		this.getAllResponses = this.getAllResponses.bind(this)


		this.init()
	}

	async init (){
		try{
			if(this.client.controllers.mongo.ready){
				const responses = await this.client.controllers.mongo.getResponses()

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
		else if(isClientMentioned) message.reply(`لو محتاجين مساعدة تقدروا تكتبوا \`${this.client.prefix} help\``)
	}

	async teach (response){
		this.responses[response.invoker] = response
		return this.client.controllers.mongo.saveResponse(response)
	}

	getAllResponses (){
		return this.responses
	}

}

module.exports = ConversationController