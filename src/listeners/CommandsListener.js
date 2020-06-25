const { Listener } = require('../structures');
const {
	GENERIC_COMMAND_NOT_UNDERSTOOD,
	ERROR_COMMAND_DOES_NOT_EXIST
} = require('../config/events.json');

class CommandsListener extends Listener {
	constructor(client) {
		super(client, ['command']);
	}

	async onCommand(message) {
		const { content } = message;

		const commandRegex = RegExp(`(${this.prefix}\\s+)([a-zA-Z؀-ۿ]+)(\\s+)?`);
		const matchGroup = content.match(commandRegex);

		if (matchGroup === null)
			return message.reply(GENERIC_COMMAND_NOT_UNDERSTOOD);

		const [, , commandName] = matchGroup; //2nd match group, actual command name
		const command = this.commands[commandName];

		if (command === undefined)
			return message.reply(ERROR_COMMAND_DOES_NOT_EXIST);
		else command.run(message);
	}
}

module.exports = CommandsListener;
