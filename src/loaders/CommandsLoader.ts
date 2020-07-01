import Loader from '../structures/Loader';
import * as commands from '../commands';
import ValClient from '../ValClient';
// import Command from '../structures/Command';

import { log } from '../utils/general';

/**
 * Loads commands based on commands/index
 */
export default class CommandsLoader extends Loader {
	constructor(client: ValClient) {
		super(client);
	}

	load = (): void => {
		Object.values(commands).forEach(command => {
			const newCommand = new command(this.client);
			this.client.commands.set(newCommand.options.name, newCommand);
		});

		log(this.client, 'Commands loaded successfully', 'info');
	};
}
