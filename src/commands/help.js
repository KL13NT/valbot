const { Command } = require('../structures')
const { CommandOptions } = require('../structures')

class Help extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: 'help',
			cooldown: 0,
			nOfParams: 0,
			extraParams: true,
			description: `لو محتاج مساعدة`,
			exampleUsage: `\`val! help\` او \`val! help command\``,
			auth: {
				method: 'ROLE',
				required: 'AUTH_EVERYONE'
			}
		})

		super(client, options)
	}

	async _run(context) {
		const { message, params, channel } = context
		const lines = [
			`اهلاً اهلاً. شوف القايمة دي, متقسمه لعناوين حسب اللي انت ممكن تحتاجه`,
			`\n**مساعدة مع كوماند معينة**`,
			`تقدروا تكتبوا help بعد الكوماند زي كده: \`${this.client.prefix} clear help\``,
			`\n**لو عندكوا اسئلة**`,
			`لو عايز تسأل على حاجة معينة ممكن تشوف تشانل <#586789353217327104> او تسأل حد من الـ moderators`,
			`\n**لو عايزين تعملوا invite لحد**`,
			`https://discord.gg/xrGAnTg`,
			`\n**الكوماندز الموجودة دلوقتي**`,
			`\`${Object.keys(this.client.commands).join('`\n`')}\``
		]

		message.reply(lines.join('\n'))
	}
}

module.exports = Help
