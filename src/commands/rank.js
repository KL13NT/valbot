const { Command, CommandOptions } = require(`../structures`)
const { generateRankCard } = require('../utils/svg')
const { log, getMemberObject } = require('../utils/utils')


class Rank extends Command{
	constructor (client){
		const commandOptions = new CommandOptions({
      name: `rank`,
			cooldown: 1000,
			nOfParams: 0,
			requiredAuthLevel: 3,
			description: `بتشوف مستوى شخص ما`,
			exampleUsage: `val! rank <user_id>`,
			extraParams: true
    })
    super(client, commandOptions)
	}

	async _run(context){
		try{
			const { message, params, channel, member: ctxMember } = context
			const [ userMention ] = params

			const id = userMention? userMention.replace(/<|>|!|@/g, ''): ctxMember.user.id

			if(id === process.env.CLIENT_ID) return message.reply('متكترش هزار عشان ميتعملش عليك صريخ ضحك :"D');

			const member = getMemberObject(this.client, id)

			MongoController.getLevel(id).then(async res => {
				const avatar_url = member.user.avatarURL()
				const displayName = member.user.username
				const displayID = member.user.tag.split('#')[1]

				const voice = res? res.voice: await RedisController.get(`VOICE:${id}`)
				const text = res? res.text : await RedisController.get(`TEXT:${id}`)
				const exp = await RedisController.get(`EXP:${id}`)

				const card  = generateRankCard({
					avatar_url,
					displayName: displayName.length > 9? displayName.substr(0, 9) + '..': displayName,
					displayID,
					exp: {
						voice: voice,
						text: text,
						expToNextLevel: ((60 * Number(text) * 0.1) + 60) - Number(exp)
					}
				})
				.then(card => {
					channel.send("Here's the requested rank", {
						files: [{
							attachment: card
						}]
					});
				})
			}).catch(err => {
				log(err)
			})
		}
		catch(err){
			console.error(err)
			context.message.reply(err.message)
		}
	}
}

module.exports = Rank