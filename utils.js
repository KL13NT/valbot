// eslint-disable-next-line prefer-destructuring


export const craftWelcomeMessage = displayName => 
  `Hey, ${displayName}, Welcome to Valarium :tada::hugging:! We are glad to have you with us! Please consider reading the <#571718462179770369> and getting yourself some <#586620199457914904> :wink: before heading to <#571721246362959919> to contribute to our great community!`


/**
 * Updates the memberCount channel name according to the number of members present
 * @async
 * @name updateMemberCount
 */

export const updateMemberCount =  async function (){
  try{
    const { memberCount } = __ENV.__VALARIUM_GUILD()

    await __ENV.__MEMBER_COUNT_CHANNEL().edit({ name: `Members: ${memberCount}` })
    console.log(`Updated member count. New count is: ${memberCount}`)
  }
  catch(err){
    console.log('Could not execute updateMemberCount\n', err)
  }
}


export const enforceCommandArguments = async (message, requiredArgs, passedArgs) => {
  if(passedArgs.length !== requiredArgs) {
    onCommandArgsNotCorrect(message, requiredArgs, passedArgs)
    return false
  }
  else{
    let valid = true
    passedArgs.forEach(arg => {
      if(valid !== true) return
      if(arg==='' || arg.length === 0) valid = false
    })
    return valid
  }
}

export const onCommandArgsNotCorrect = async (message, requiredArgs, passedArgs) => {
  await message.reply(`This command takes ${requiredArgs} arguments, passed was ${passedArgs.length}.`)
}


export const getWarningsFromDatabase = async (warnedMember, __ENV) => {
  try{
    const warnings = await __ENV.__DATABASE_OBJECT.collection('GUILD_WARNINGS').findOne({ USER_ID: warnedMember.id })
    return warnings
  }
  catch(err){ console.log(err) }
}


/**
 * Launched on startup to load needed data
 * @async 
 * @name onStartup
 */
export const onStartup = async function (){
  try { 
    global.__ENV.__DATABASE_OBJECT = await require('./dbconnect').getDB()
    global.__ENV.__AVAILABLE_ROLES = await __ENV.__DATABASE_OBJECT.collection('AVAILABLE_ROLES').find({}).project({ _id:0 }).toArray()
    global.__ENV.__WATCHED_MESSAGES = await __ENV.__DATABASE_OBJECT.collection('WATCHED_MESSAGES').find({}).toArray()
    global.__ENV.__DATABASE_OBJECT.collection('GUILD_WARNINGS').deleteMany({})
  }
  catch(err){
    console.log('Error in onStartup', console.trace)
  }
}



/**
 * Checks whether a message is being watched for reactions
 * @function
 * @name checkWatchedMessage
 * @param {Message} message The message object to check
 * @return {Document} The watched message fetched from DB
 * @since 1.0.0
 */
export const checkWatchedMessage = message => __ENV.__WATCHED_MESSAGES.find(watched => watched.MESSAGE_ID === message.id)

const [Heda, HighTableMember, Protectors, Volatile, Tester] = ['571716246660448318', '571705643073929226', '571705797583831040', '571710033210114069', '571824921576079362']

const commandCategories = [
  // {
  //   name: 'ban',
  //   roles: [HighTableMember]
  // },
  // {
  //   name: 'unban',
  //   roles: [HighTableMember]
  // },
  {
    name: 'mute',
    roles: [HighTableMember, Protectors]
  },
  {
    name: 'unmute',
    roles: [HighTableMember, Protectors]
  },
  {
    name: 'warn',
    roles: [HighTableMember, Protectors]
  },
  {
    name: 'dmAllMembers',
    roles: [HighTableMember]
  },
  {
    name: 'clear',
    roles: [HighTableMember]
  },
  {
    name: 'reactionRoles',
    roles: [HighTableMember]
  }
]

export const isAllowedToUseCommand = function (callee, commandName){
  try{
    const userRoles = callee.roles.map(role => role.id)
    const index = commandCategories.findIndex(command => command.name === commandName)
    let allowed = false
    
    if(index !== -1){
      const commandInfo = commandCategories[index]
      commandInfo.roles.forEach(role => {
        if(allowed === true) return 
        if(userRoles.includes(role)) allowed = true
      })
      return allowed
    }
    else return false
  }
  catch(err){
    console.log('Something went wrong in isAllowedToUseCommand', err)
  }
}





export const formatMentionReason = rest => {
  const [mention, ...reason] = rest
  return [ mention.toString().replace(/<|>|@/ig, ''), reason.join(' ') ]
}