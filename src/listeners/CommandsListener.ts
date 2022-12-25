import Listener from "../structures/Listener";
import ValClient from "../ValClient";
import { Message } from "discord.js";

import logger from "../utils/logging";
import { Command } from "../structures";

export default class CommandsListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["command"]);
	}

	onCommand = async (message: Message) => {
		try {
			const { content } = message;

			const commandRegex = RegExp(`${this.client.prefix}([a-zA-Z؀-ۿ]+)(\\s+)?`);
			const matchGroup = content.replace(/\s+/gi, " ").match(commandRegex);

			if (matchGroup === null) return;

			const [, commandName] = matchGroup; // [fullMatch, commandName]
			const command = this.client.commands.get(
				commandName.toLowerCase(),
			) as Command;

			if (command === undefined) {
				logger.info("command not found");
				return;
			} else if (command instanceof Command) {
				logger.info("command instanceof command");
				await command.run(message);
			} else {
				await message.reply("This command can only be run as a slash command");
			}
		} catch (error) {
			logger.error(error);
		}
	};
}
