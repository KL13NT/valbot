const { CommandContext } = require('..')
const { Listener } = require('../structures')
const { CLIENT_ID: BotID } = process.env

class NewGuildMemberListener extends Listener {
	constructor (client) {
		super(client, [
			'guildMemberAdd'
		])
	}



	async onGuildMemberAdd (member) {
		try{

			const dm = await member.createDM()
			dm.send(`
			اهلاً بيكوا في فالاريوم! سعداء بيكم معانا جداً! :sparkler: :partying_face:
			حابين انكوا تقروا القواعد الاول في تشانل #rules.
			لو في صعوبات في التعامل مع ديسكورد او السيرفر تحديداً تقدروا تتفرجوا على الفيديو ده او تسألوا ف السيرفر: https://youtu.be/J56Ww0_GiTc
			اهلاً بيك مره تانية, و لو في اي حاجة نقدر نساعدك فيها متترددش! اعتبرنا بيتك التاني :star_struck:
			`)

		}
		catch(err){
			console.log(err)
			const management = this.channels.find(channel => channel.id == '571741573134417920')
			if(management) management.send('Something went wrong while greeting the new member, could yall do it for me?')
		}
	}

}

module.exports = NewGuildMemberListener