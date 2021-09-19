import Listener from "../structures/Listener";
import ValClient from "../ValClient";
import { Message } from "discord.js";

import {
	GENERIC_COMMAND_NOT_UNDERSTOOD,
	ERROR_COMMAND_DOES_NOT_EXIST,
} from "../config/events.json";
import { log } from "../utils/general";

export default class CommandsListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["command"]);
	}

	onCommand = (message: Message): void => {
		try {
			const { content } = message;

			const commandRegex = RegExp(`${this.client.prefix}([a-zA-Z؀-ۿ]+)(\\s+)?`);
			const matchGroup = content.replace(/\s+/gi, " ").match(commandRegex);

			if (matchGroup === null) {
				message.reply(GENERIC_COMMAND_NOT_UNDERSTOOD);
				return;
			}

			const [, commandName] = matchGroup; // [fullMatch, commandName]
			const command = this.client.commands.get(commandName);

			if (command === undefined) message.reply(ERROR_COMMAND_DOES_NOT_EXIST);
			else command.run(message);
		} catch (error) {
			log(this.client, error, "error");
		}
	};
}
