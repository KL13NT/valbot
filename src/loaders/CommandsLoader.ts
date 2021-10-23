import Loader from "../structures/Loader";
import * as commands from "../commands";

import logger from "../utils/logging";

/**
 * Loads commands based on commands/index
 */
export default class CommandsLoader extends Loader {
	load = (): void => {
		Object.values(commands).forEach(command => {
			// eslint-disable-next-line new-cap
			const newCommand = new command(this.client);

			/**
			 * import commmands
			 * iterate over each command, if has aliases -> iterate over them
			 * client.commands.set(alias/name, commandObject) previousNow
			 *
			 * get(previousnow) X
			 */
			if (newCommand.options.aliases) {
				newCommand.options.aliases.forEach(alias => {
					if (this.client.commands.get(alias))
						throw new Error(`Conflicting command aliases found: ${alias}`);

					this.client.commands.set(alias, newCommand);
				});
			}

			this.client.commands.set(
				newCommand.options.name.toLowerCase(),
				newCommand,
			);
		});

		logger.info("Commands loaded successfully");
	};
}
