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
			exampleUsage: ` او val! help command`,
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
		const commands: Map<string, string> = new Map<string, string>();

		Array.from(this.client.commands.values()).forEach(command => {
			const key = command.options.category;
			const value = commands.get(key);

			if (value) commands.set(key, `${value}\n\`${command.options.name}\``);
			else commands.set(key, `\`${command.options.name}\``);
		});

		const fields: EmbedField[] = [];
		for (const category of commands) {
			fields.push({
				name: category[0],
				value: category[1],
				inline: true
			});
		}

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
