import ValClient from '../ValClient';

import { EmbedField } from 'discord.js';
import { Command, CommandContext } from '../structures';
import { createEmbed } from '../utils/embed';
import { log } from '../utils/general';

export default class Help extends Command {
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
		const commands = this.commandsAsFields();
		const embed = this.createHelpEmbed(commands);

		try {
			const dm = await member.createDM();
			await dm.send(embed);

			const sent = await message.reply('بعتلك رسالة جادة جداً');

			setTimeout(() => {
				sent.delete().catch(err => log(this.client, err, 'error'));
			}, 5 * 1000);
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	commandsAsFields = () => {
		const sorted = Array.from(this.client.commands.values()).sort((a, b) => {
			return a.options.category < b.options.category ? -1 : 1;
		});

		let cat = '';
		let commandString = '';
		let fields: EmbedField[] = [];

		sorted.forEach(command => {
			commandString += `\`${command.options.name}\`\n`;

			if (cat !== command.options.category) {
				cat = command.options.category;

				fields.push({
					name: cat,
					value: commandString,
					inline: true
				});

				commandString = '';
			}
		});

		return fields;
	};

	createHelpEmbed = (commands: EmbedField[]) =>
		createEmbed({
			title: ':book: مساعدة',
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
					name: '\u200b',
					value: '\u200b'
				},
				{
					name: '**الكوماندز الموجودة دلوقتي**',
					value: `\u200b`
				},
				...commands
			]
		});
}
