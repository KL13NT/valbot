/**
 * 
 * @param {DiscordGuildMessage} message The original message object
 * @param {Array} rest Array resulting from splitting the message and removing [val!, commandName]
 */

export const warn = async (message, rest) => {
  if(!enforceCommandArguments(message, 2, rest)) return

  const [memberMention, reason] = rest
  const memberId = memberMention.toString().replace(/<|>|@/ig, '')
  const date = new Date().toString()
  const callee = message.member

  try{
    const warnedMember = await __ENV.__VALARIUM_GUILD().fetchMember(memberId)

    const userWarnings = (await __ENV.__DATABASE_OBJECT.collection('GUILD_WARNINGS').findOneAndUpdate({ USER_ID: warnedMember.id }, {
      $push: { 
        RECORDED_WARNINGS: {
          WARNING_REASON: reason,
          WARNING_DATE: new Date().toString()
        }   
      }
    }, { upsert: true, returnOriginal: false })).value

    sendEmbedNotification(
      warnedMember, 
      { 
        description: `${warnedMember} has been warned at ${date} by ${callee}`, 
        title:`WARNING, ${warnedMember}`, 
        color: 0xfade78,
        footer: date
      }, [
        { name: 'Member', value: `${warnedMember}` }, 
        { name: 'Moderator', value: `${callee}` }, 
        { name: 'Reason', value: reason }, 
        { name: 'Status', value: `This user now has ${userWarnings.RECORDED_WARNINGS.length} warnings` }
      ], 
      [], 
      [__ENV.__MODERATION_NOTICES_CHANNEL()])

    if(userWarnings.RECORDED_WARNINGS.length === 3){
      // ban(message, args, __ENV, 'Warned 3 times')
      console.log('USER SHOULD BE BANNED')
    }
  }
  catch(err){ console.log(err) }
}