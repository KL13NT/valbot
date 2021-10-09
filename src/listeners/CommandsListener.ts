import Listener from "../structures/Listener";
import ValClient from "../ValClient";
import { Message } from "discord.js";

import { log } from "../utils/general";

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
			const command = this.client.commands.get(commandName.toLowerCase());

			if (command === undefined) return;
			else command.run(message);
		} catch (error) {
			log(this.client, error, "error");
		}
	};
}
