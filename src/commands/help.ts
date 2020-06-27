import { Command, CommandContext } from '../structures';
import { createEmbed } from '../utils/embed';
import ValClient from '../ValClient';

export default class Help extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
	constructor(client: ValClient) {
		super(client, {
			name: 'help',
			category: 'Support',
			cooldown: 0,
			nOfParams: 0,
			extraParams: true,
			optionalParams: 0,
			description: `لو محتاج مساعدة`,
			exampleUsage: `\`val! help\` او \`val! help command\``,
			auth: {
				method: 'ROLE',
				required: 'AUTH_EVERYONE'
			}
		});
	}

	_run = async ({ message, member }: CommandContext) => {
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
		});

		// create an object of category: [...commandNames] for easier joining to strings
		const commands: { [index: string]: string[] } = {};

		for (const command in this.client.commands) {
			const { category, name } = this.client.commands.get(command).options;

			if (!commands[category]) commands[category] = [];
			commands[category].push(name);
		}

		Object.keys(commands).forEach(cat => {
			const categoryCommands = `\`${commands[cat].join('`\n`')}\``;
			embed.addField(cat, categoryCommands, true);
		});

		const dm = await member.createDM();
		await dm.send(embed);

		const sent = await message.reply('بعتلك رسالة جادة جداً');

		setTimeout(() => {
			sent.delete();
		}, 5 * 1000);
	};
}
