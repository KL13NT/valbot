const path = require('path')

const { CLIENT_ID, DEV_CLIENT_ID } = process.env
const { CommandContext } = require('..')
const { Listener } = require('../structures')
const { GENERIC_COMMAND_NOT_UNDERSTOOD, ERROR_COMMAND_DOES_NOT_EXIST } = require('../config/events.json')

class MessageListener extends Listener {
	constructor (client) {
		super(client, [
			'message'
		])

	}

	async onMessage (message){
		const commandRegex = RegExp(`(${this.prefix}\\s+)([a-zA-Z؀-ۿ]+)(\\s+)?`)
		const { content, member, author, type } = message

		if(author.id !== CLIENT_ID && author.id !== DEV_CLIENT_ID && type !== 'dm'){

			//TODO: perhaps implement a DB to collect deleted messages in case of false positives? Maybe a bit too overkill
			if(this.ToxicityFilter && this.ToxicityFilter.ready) await this.ToxicityFilter.classify(message)


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
							attachment: path.resolve(__dirname, '../media/b7bk.jpg'),
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

			if(matchGroup === null) return message.reply(GENERIC_COMMAND_NOT_UNDERSTOOD)


			const [ ,, commandName ] = matchGroup
			const command = this.commands[ commandName ] //2nd match group, actual command name

			if(command === undefined) return message.reply(ERROR_COMMAND_DOES_NOT_EXIST)
			else command.run(message)
		}
	}


	static checkParams (command, params){
		const { nOfParams, extraParams } = command.options

		if(extraParams && params.length >= nOfParams) return true
		else if(!extraParams) return params.length === nOfParams
	}


}

module.exports = MessageListener