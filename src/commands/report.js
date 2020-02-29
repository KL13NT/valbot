const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { sendEmbed, getChannelObject } = require('../utils/utils.js')

class Report extends Command {
  constructor(client) {

		const options = new CommandOptions({
			name: `report`,
			cooldown: 10 * 1000,
			nOfParams: 2,
			requiredAuthLevel: 3,
			description: `بتعمل ريبورت لرسالة حد بعتها و السبب. لازم الريبورت يتعمل في نفس التشانل. بتعمل منشن للشخص اللي عايز تعمله ريبورت بالشكل التالي:`,
			exampleUsage: `val! report @Sovereign Violation of rules`,
			extraParams: true
		})

		super(client, options)
  }

  async _run(context) {
		const { reports } = process.IMPORTANT_CHANNELS
		const { CLIENT_ID, DEV_CLIENT_ID } = process.env
		const { message, member, params, channel } = context

		try{
			const mentions = Array.from(message.mentions._members.values())
			const reportedMember = mentions[0]

			if(message.mentions.everyone) return message.reply('مينفعش تعمل ريبورت للسيرفر كله, خاف على نفسك بقى عشان معملكش انت ريبورت')
			if(mentions.length === 0) return message.reply('لازم تعمل منشن للشخص اللي بتعمله ريبورت')
			if(mentions.length > 1) return message.reply('يبشا ريبورت لواحد بس, هي حفلة؟ :PutinFacepalms:')
			if(reportedMember.id === member.id) return message.reply('مساء الهزار, ريبورت لنفسك؟')
			if(reportedMember.id === CLIENT_ID || reportedMember.id === DEV_CLIENT_ID) return message.reply('متهزرش معايا عشان خلقي ضيق')
			if(!/<@.+>/.test(message.content.split(' ')[2])) return message.reply('المنشن لازم تكون اول باراميتير')

			const reason = message.content.split(' ').slice(3).join(' ')
			const embedOptions = {
					embedOptions: {
						title: 'Message Report',
						description: `${member} reported ${reportedMember}`
					},
					fields: [
						{
							name: 'Reporter',
							value: member
						},
						{
							name: 'Reported',
							value: reportedMember
						},
						{
							name: 'Time',
							value: new Date().toUTCString()
						},
						{
							name: 'Reason',
							value: reason
						},
						{
							name: 'Channel',
							value: channel.name
						},
						{
							name: 'CC',
							value: `<@&571705643073929226> <@&571705797583831040>`
						},

					],
					channels: [getChannelObject(this.client, reports)]
				}

			await sendEmbed(message, embedOptions)
			message.reply('عملت الريبورت خلاص. شوية كده و هنشوف ايه الحوار, لو حد مضايقك اضربه عبال ما اجيلك')
		}

		catch(err){
			message.reply('في حاجة مش تمام حصلت. جرب تاني بعدين او قول للمطورين')
		}
	}
}

module.exports = Report