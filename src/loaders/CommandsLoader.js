const FileUtils = new (require(`../utils/FileUtils`))(__dirname)
const { Loader, Command } = require(`../structures`)
const Commands = require(`../commands`)

/**
 * Loads commands based on commands/index
 */
module.exports = class CommandsLoader extends Loader{
	/**
	 *
	 * @param {ValClient} client used to attach loaded commands
	 */
	constructor (client) {
		super(client)
	}

	load () {

		Commands.forEach(async command => {
			const newCommand = new command(this.client)

			this.client.commands[newCommand.options.name] = newCommand
		})
	}
}