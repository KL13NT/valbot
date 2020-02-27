const { Command } = require("../structures")
const { CommandOptions } = require("../structures")
const { sendEmbed, getChannelObject } = require('../utils/utils.js')

class Report extends Command {
  constructor(client) {

		const options = new CommandOptions(
			`report`,
			10 * 1000,
			2,
			3,
			`بتعمل ريبورت لرسالة حد بعتها و السبب. لازم الريبورت يتعمل في نفس التشانل. بتعمل منشن للشخص اللي عايز تعمله ريبورت بالشكل التالي:`,
			`val! report @Sovereign Violation of rules`
		)

		super(client, options)
  }

  async _run(context) {
		const { reports } = process.IMPORTANT_CHANNELS
		const { message, member, params, channel } = context

		try{
			const reportedMember = message.mentions._members.first()

			if(message.mentions.length === 0) return message.reply('لازم تعمل منشن للشخص اللي بتعمله ريبورت')
			if(reportedMember.id === member.id) return message.reply('مساء الهزار, ريبورت لنفسك؟')

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
							value: params[1]
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