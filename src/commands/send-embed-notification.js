const { RichEmbed } = require(`discord.js`)

export const sendEmbedNotification = async function (member, embedOptions, fields, attachments, channels, callback) {
  try{
    const embed = new RichEmbed(embedOptions)
    embed.setThumbnail(`https://lh4.googleusercontent.com/Yic_fQ7O-bo2q1ELjzBTQaR3ljVG-coyKsj87E55QzuxrH4b0K1F2ZchjFVrQ_QBA93fc1xWczkD7LGPMTsO`)
    
    if(fields.length > 0){
      fields.forEach(field => field.name===`Moderator` || field.name===`Member`? embed.addField(field.name, field.value, true): embed.addField(field.name, field.value))
    }
    
    if(attachments){
      attachments.forEach(attachment => {
        embed.attachFile(attachment.path)
      })
    }

    
    if(channels){
      channels.forEach(channel => {
        channel.send(embed)
      })
    }
    
    if(member){
      const DMChannel = await member.createDM()
      await DMChannel.send(embed)
    }

    if(callback){
      callback(embed)
    }
  }
  catch(err){ console.log(err) }
}