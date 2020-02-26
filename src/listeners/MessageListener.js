const path = require('path')
const errors = require('../utils/errors')

const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { Listener } = require('../structures')
const { CommandContext } = require('..')

class MessageListener extends Listener {
	constructor (client) {
		super(client, [
			'message'
		])

	}

	async onMessage (message){
		const commandRegex = /(val!\s)([a-zA-Z؀-ۿ]+)(\s?)/
		const { content, member, author, type } = message

		if(author.id !== CLIENT_ID && author.id !== DEV_CLIENT_ID && type !== 'dm'){

			//TODO: perhaps implement a DB to collect deleted messages in case of false positives? Maybe a bit too overkill
			if(this.ToxicityFilter && this.ToxicityFilter.ready){
				if(await this.ToxicityFilter.classify(message.content)){

					message.reply(`لو سمحت متستعملش لغة بذيئة, انا بتكلم بالأدب اهو. لو عايز تعرف القوانين بتاعت المكان ده خش على <#${this.IMPORTANT_CHANNELS.rules}>`)

					await this.autoWarn(message)
					message.delete()

					return
				}
			}

			if(message.mentions.members.some(member => member.id === CLIENT_ID || member.id === DEV_CLIENT_ID)){
				const greetingsRegex = /ها+ي+|هي|hai|hi|hui|hello|heyo|hiya|yo|مرحب/i
				const generalRegex = /how are you|how you doin|عامل ايه|اخبارك|ايه|بتعمل ايه|([a-zA-Z؀-ۿ]+)/i
				const b7bkRegex = /بحبك|شش+ بحبك/i

				const randomResponses = [
					'مش فاهم لا',
					'انتوا لو قاصدين تزلوني عشان مش فاهم انتوا كاتبين ايه مش هتعملوا فيا كده',
					'لا بص, انا اه بعرف ارد على هاي بس متوصلش بيك الجرأة تفتكر اني بوت ذكي للدرجة دي يعني, هما كام if اللي معمولينلي, خف عليا شوية بلز',
					'خنزير, عليا الطلاق خنزير :cry:'

				]

				if(content.match(greetingsRegex)) message.reply('هاي يصحب, اخبارك ايه؟')
				else if(content.match(b7bkRegex))
					message.reply('انا اول مره اشوف حد بيحب بوت!', {
						files: [ {
							attachment: path.resolve(__dirname, '../../b7bk.jpg'),
							name: 'اول مره اشوف حد بيحب بوت.jpg'
						} ]
					})
				else if(content.match(generalRegex)) message.reply(randomResponses[ Math.floor(Math.random() * randomResponses.length) ])

			}

			if(content.startsWith(this.prefix)) {
				commandify.apply(this)
			}
		}


		async function commandify (){
			const matchGroup = content.match(commandRegex)

			if(matchGroup === null){
				message.reply(`
					في حاجة انا مش فاهمها ف اللي انت كتبته, جرب تاني
				`)

				return
			}

			const [ ,, commandName ] = matchGroup
			const command = this.commands[ commandName ] //2nd match group, actual command name
			const split = content.split(' ')
			const params = split.slice(2)

			if(split.length < 2) message.reply(errors.COMMANDS_REQUIRE_2_PARAMS)
			else if(command === undefined) message.reply(errors.COMMAND_DOES_NOT_EXIST)
			else if(params.includes('help')) command.help(message)
			else if(MessageListener.checkParams(command, params)){
				const context = new CommandContext(this, message)
				context.params = [ ...params ] //to delete old references to params and avoid memory leaks

				command.run(context)
			}
			else message.reply(errors.INSUFFICIENT_PARAMS_PASSED)


		}
	}


	static checkParams (command, params){
		return command.options.nOfParams === params.length
	}


}

module.exports = MessageListener