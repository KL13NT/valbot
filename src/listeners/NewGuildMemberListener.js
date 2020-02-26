const { CommandContext } = require(`..`)
const { Listener } = require(`../structures`)
const { CLIENT_ID: BotID } = process.env

class NewGuildMemberListener extends Listener {
	constructor (client) {
		super(client, [
			`guildMemberAdd`
		])
	}



	async onGuildMemberAdd (member) {
		try{
			
			const dm = await member.createDM()
			dm.send(`
			اهلاً بيك في فالاريوم! سعداء بيك معانا جداً! :sparkler: :partying_face:
			حابين انك تقرا القواعد الاول في تشانل #rules.
			في تشانلز مقفوله مش هتتفتح الا لما تقرا القواعد, و ده عشان نضمن ان كل الموجودين موافقين على القواعد دي و عاملين بيها.
			اهلاً بيك مره تانية, و لو في اي حاجة نقدر نساعدك فيها متترددش! اعتبرنا بيتك التاني :star_struck: 
			`)

		}
		catch(err){
			console.log(err)
			const management = this.channels.find(channel => channel.id == `571741573134417920`)
			if(management) management.send(`Something went wrong while greeting the new member, could yall do it for me?`)
		}
	}

}

module.exports = NewGuildMemberListener