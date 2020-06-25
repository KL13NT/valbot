const { Loader } = require('../structures');
const Commands = require('../commands');

const { log } = require('../utils/general');

/**
 * Loads commands based on commands/index
 */
class CommandsLoader extends Loader {
	/**
	 *
	 * @param {ValClient} client used to attach loaded commands
	 */
	constructor(client) {
		super(client);
	}

	load() {
		Commands.forEach(async command => {
			const newCommand = new command(this.client);
			this.client.commands[newCommand.options.name] = newCommand;
		});

		log(this.client, 'Commands loaded successfully', 'info');
	}
}

module.exports = CommandsLoader;
