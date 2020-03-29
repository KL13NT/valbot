const path = require('path')

const { CLIENT_ID } = process.env
const { CommandContext } = require('..')
const { Listener } = require('../structures')
const { GENERIC_COMMAND_NOT_UNDERSTOOD, ERROR_COMMAND_DOES_NOT_EXIST } = require('../config/events.json')

class CommandsListener extends Listener {
	constructor (client) {
		super(client, [
			'command'
		])
	}

	async onCommand (message){
		console.log('commands!')
		const { content, member, author, type } = message
		const commandRegex = RegExp(`(${this.prefix}\\s+)([a-zA-Z؀-ۿ]+)(\\s+)?`)
		const matchGroup = content.match(commandRegex)

		if(matchGroup === null) return message.reply(GENERIC_COMMAND_NOT_UNDERSTOOD)

		const [ ,, commandName ] = matchGroup
		const command = this.commands[ commandName ] //2nd match group, actual command name

		if(command === undefined) return message.reply(ERROR_COMMAND_DOES_NOT_EXIST)
		else command.run(message)
	}
}

module.exports = CommandsListener