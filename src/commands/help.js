const { Command } = require('../structures')
const { CommandOptions } = require('../structures')

const { createEmbed } = require('../utils/utils')

class Help extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client) {
		const options = new CommandOptions({
			name: 'help',
			category: 'Support',
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

	async _run({ message, member }) {
		const embed = createEmbed({
			title: 'Help',
			description: `اهلاً اهلاً. شوف القايمة دي, متقسمه لعناوين حسب اللي انت ممكن تحتاجه`,
			fields: [
				{
					name: '**مساعدة مع كوماند معينة**',
					value: `تقدروا تكتبوا help بعد الكوماند زي كده: \`${this.client.prefix} clear help\``
				},
				{
					name: '**لو عندكوا اسئلة**',
					value: `ممكن تشوفوا تشانل <#586789353217327104> او تسألوا حد من الـ Mods`
				},
				{
					name: '**لو عايزين تعملوا invite لحد**',
					value: `https://discord.gg/xrGAnTg`
				},
				{
					name: '**الكوماندز الموجودة دلوقتي**',
					value: `\u200b`
				}
			]
		})

		const commands = {}

		Object.values(this.client.commands).forEach(command => {
			const { category, name } = command.options

			if (!commands[category]) commands[category] = []
			commands[category].push(name)
		})

		Object.keys(commands).forEach(cat => {
			const categoryCommands = `\`${commands[cat].join('`\n`')}\``
			embed.addField(cat, categoryCommands, true)
		})

		member.createDM().then(dm => {
			dm.send(embed)
			message.reply('بعتلك رسالة جادة جداً').then(sent => {
				setTimeout(() => {
					sent.delete()
				}, 5 * 1000)
			})
		})
	}
}

module.exports = Help
