const fs = require(`fs`)
const path = require(`path`)
const FileUtils = new (require(`../utils/FileUtils`))()
const { Loader } = require(`../structures`)

module.exports = class CommandsLoader extends Loader{
  constructor (client) {
    super(client)
  }

  load () {
    this.commands = FileUtils
      .readdir(__dirname, `../commands`)
      .reduce((acc = [], cur) => {
        if(cur.charAt(0) !== cur.charAt(0).toLowerCase()){ //first letter is capitalised
          return [ ...acc, cur.replace(`.js`, ``) ]
        }
        return acc
      }, [])

    this.commands.forEach(async command => {
      const Command = require(`../commands/${command}`)
      const newCommand = new Command(this.client)
        
      if(newCommand.isReady) this.client.commands[command] = newCommand
    })
  }
}