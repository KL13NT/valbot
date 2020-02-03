const fs = require(`fs`)
const path = require(`path`)
const FileUtils = new (require(`../utils/FileUtils`))(__dirname)
const { Loader } = require(`../structures`)

module.exports = class CommandsLoader extends Loader{
	constructor (client) {
		super(client)
	}

	load () {
		console.log(__dirname, path.resolve(__dirname, '../commands'))
		this.commands = FileUtils
			.readDir(`../commands`)
			.reduce((acc = [], cur) => {
				if(cur.charAt(0) === cur.charAt(0).toUpperCase()){ //first letter is capitalised
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