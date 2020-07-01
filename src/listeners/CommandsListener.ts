import Listener from '../structures/Listener';
import ValClient from '../ValClient';
import { Message } from 'discord.js';

import {
	GENERIC_COMMAND_NOT_UNDERSTOOD,
	ERROR_COMMAND_DOES_NOT_EXIST
} from '../config/events.json';

export default class CommandsListener extends Listener {
	constructor(client: ValClient) {
		super(client, ['command']);
	}

	onCommand = (message: Message): void => {
		const { content } = message;

		const commandRegex = RegExp(
			`${this.client.prefix}\\s+([a-zA-Z؀-ۿ]+)(\\s+)?`
		);
		const matchGroup = content.match(commandRegex);

		if (matchGroup === null) {
			message.reply(GENERIC_COMMAND_NOT_UNDERSTOOD);
			return;
		}

		const [, commandName] = matchGroup; // [fullMatch, commandName]
		const command = this.client.commands.get(commandName);

		if (command === undefined) message.reply(ERROR_COMMAND_DOES_NOT_EXIST);
		else command.run(message);
	};
}
