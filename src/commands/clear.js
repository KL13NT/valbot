import CommandStructure from "../structures"

export default class Clear extends Structures.Command {
  constructor(client, options={}) {
    super(client, options)
  }
  
  run() {
      const count = parseInt(rest[0])
  
      if(!enforceCommandArguments(message, 1, rest)) return
  
      if(count === 0) {
        message.reply('Supplying 0 as count is a dangerous move. Please supply `n` where `n > 0`')
        return
      }
      let deletedMessages = await message.channel.bulkDelete(count)
      deletedMessages = deletedMessages.map(message => ({ author: { name: message.author.username, id: message.author.id }, content: message.content }))
      __ENV.__DATABASE_OBJECT.collection('DELETED_MESSAGES').insertMany(deletedMessages)
  
      message.reply(`deleted ${count} messages.`)
  }

  formatCommandMessage() {
    
  }
  
}