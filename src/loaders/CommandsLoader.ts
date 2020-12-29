import Loader from "../structures/Loader";
import * as commands from "../commands";

import { log } from "../utils/general";

/**
 * Loads commands based on commands/index
 */
export default class CommandsLoader extends Loader {
	load = (): void => {
		Object.values(commands).forEach(command => {
			// eslint-disable-next-line new-cap
			const newCommand = new command(this.client);
			this.client.commands.set(newCommand.options.name, newCommand);
		});

		log(this.client, "Commands loaded successfully", "info");
	};
}
