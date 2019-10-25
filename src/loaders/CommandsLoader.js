const fs = require(`fs`)
const path = require(`path`)
const { Loader } = require(`../structures`)

module.exports = class CommandsLoader extends Loader{
  constructor (client) {
    super(client)
  }

  async load () {
    this.commands = fs
      .readdirSync(path.resolve(__dirname, `../commands`))
      .reduce((acc = [], cur) => { 
        if(cur.charAt(0) !== cur.charAt(0).toLowerCase()){
          return [...acc, cur.replace(`.js`, ``)]
        }
      })
    //TODO: Take this function out into a FIleUtils

    this.commands.forEach(async command => {
      const Command = require(`../commands/${command}`)
      
      this.client.commands[command] = new Command(this.client)
    })

    console.log(this.client.commands)
  }
}