const fs = require(`fs`)
const path = require(`path`)
const FileUtils = new (require(`../utils/FileUtils`))(__dirname)
const { Loader, Command } = require(`../structures`)

module.exports = class CommandsLoader extends Loader{
	constructor (client) {
		super(client)
	}

	load () {
		this.commands = FileUtils
			.readDir(`../commands`)
			.reduce((acc = [], cur) => {
				if(new require(`../commands/${cur}`)().prototype instanceof Command){ //first letter is capitalised
					return [ ...acc, cur.replace(`.js`, ``) ]
				}
				return acc
			}, [])


		this.commands.forEach(async command => {
			const Command = require(`../commands/${command}`)
			const newCommand = new Command(this.client)

			this.client.commands[command] = newCommand
		})
	}
}