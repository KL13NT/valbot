const { Command, CommandOptions } = require(`../structures`)
const { generateRankCard } = require('../utils/svg')
const { log, getMemberObject } = require('../utils/utils')


class Rank extends Command{
	constructor (client){
		const commandOptions = new CommandOptions({
      name: `rank`,
			cooldown: 1000,
			nOfParams: 0,
			requiredRole: 'verified',
			description: `بتشوف مستوى شخص ما`,
			exampleUsage: `rank <user_id>`,
			extraParams: true
    })
    super(client, commandOptions)
	}

	async _run(context){
		try{
			const { message, params, channel, member: ctxMember } = context
			const [ userMention ] = params

			const id = userMention? userMention.replace(/<|>|!|@/g, ''): ctxMember.user.id

			if(id === process.env.CLIENT_ID || id === process.env.CLIENT_DEV_ID) return message.reply('متكترش هزار عشان ميتعملش عليك صريخ ضحك :"D');

			const member = getMemberObject(this.client, id)

			MongoController.getLevel(id).then(async res => {
				const avatar_url = member.user.avatarURL()
				const displayName = member.user.username.substr(0, 12)
				const displayID = member.user.tag.split('#')[1]

				const voice = res? res.voice: await RedisController.get(`VOICE:${id}`)
				const text = res? res.text : await RedisController.get(`TEXT:${id}`)
				const exp = await RedisController.get(`EXP:${id}`)
				const level = await RedisController.get(`LEVEL:${id}`)

				const userInfo = {
					avatar_url,
					displayName,
					USER_ID: displayID
				}
				const levelInfo = {
					exp,
					text,
					voice,
					level,
					levelEXP: ((60 * Number(level) * 0.1) + 60)
				}

				generateRankCard(userInfo, levelInfo)
					.then(card => {
						channel.send("Here's the requested rank", {
							files: [{
								attachment: card
							}]
						});
					})
			})
		}
		catch(err){
			console.error(err)
			context.message.reply(err.message)
			log(this.client, err, 'error')
		}
	}
}

module.exports = Rank