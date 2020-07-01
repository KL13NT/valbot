import ValClient from '../ValClient';

import { ClientConfig } from '../types/interfaces';
import { Command, CommandContext } from '../structures';
import { Message, TextChannel, GuildMember } from 'discord.js';
import { MongoController, QueueController } from '../Controllers';

import { log, awaitMessages } from '../utils/general';
import { ClientConfigValidator } from '../types/validators.joi';

export default class Setup extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'setup',
			category: 'Development',
			cooldown: 1000,
			nOfParams: 2,
			description: 'بتعمل setup للبوت. مينفعش تعمل cancel.',
			exampleUsage:
				'get all\nget AUTH_ADMIN\nset all\nset AUTH_ADMIN\nset json',
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_DEV',
				devOnly: true
			}
		});
	}

	_run = async (context: CommandContext) => {
		const { message, params } = context;
		const config = this.client.config;

		const op = params[0];
		const variable = params[1];
		const target = params[1].toLowerCase();

		try {
			if (op !== 'get' && op !== 'set') {
				await message.reply('لازم تحدد `set` ولا `get`');
				return;
			}

			if (op === 'get') {
				if (target === 'all') {
					const values = Object.keys(config).map(key => {
						return `\`${key}\` = \`${config[key]}\``;
					});

					await message.reply(values.join('\n'));
					return;
				} else if (target === 'json') {
					await this.getJSON(context);
				} else {
					await message.reply(`\`${variable}\` = \`${config[variable]}\``);
					return;
				}
			}

			if (op === 'set') {
				if (target === 'json') await this.setJSON(context);
				else if (target === 'all') await this.setAll(context);
				else await this.setGeneral(context, variable);
			}
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	getJSON = async (context: CommandContext) => {
		await context.message.reply(JSON.stringify(this.client.config));
	};

	setAll = async ({ message, channel, member }: CommandContext) => {
		await message.reply('starting config setup. This is irreversible.');

		const questions = Object.keys(this.client.config).map(variable =>
			this.getKeyValue.bind(
				null,
				<TextChannel>channel,
				member,
				variable,
				this.client.config
			)
		);

		for (const question of questions) {
			await question();
		}

		await message.reply('Saving config');

		await this.updateConfig(this.client.config);
		this.client.ready = true;
	};

	setGeneral = async (
		{ message, channel, member }: CommandContext,
		key: string
	) => {
		await message.reply('ايه القيمة؟');

		const value = await awaitMessages(<TextChannel>channel, member);

		this.client.config[key] = value;
		await this.updateConfig(this.client.config);
		await message.reply(`تم.\n\`${key}\` = \`${value}\``);
	};

	setJSON = async ({ message, channel, member }: CommandContext) => {
		await message.reply(
			'حاسب, لما تستعمل JSON بدل ما تحدد كل متغير لوحدة بمسح الكونفيج الموجود و بسجل مكانه ال JSON. مفيش رجوع. ابعت ال JSON.'
		);

		const jsonString = await awaitMessages(<TextChannel>channel, member);

		try {
			const json = JSON.parse(jsonString);

			if (ClientConfigValidator.validate(json).error) {
				await message.reply('الداتا دي مش ماشية على السكيما صح.');
				return;
			} else {
				this.updateConfig(json);
				await message.reply('تم. الكونفيج الجديد اتسجل.');
				return;
			}
		} catch (err) {
			await message.reply('في حاجة غلط ف ال JSON اللي انت كتبته. جرب تاني.');
			log(this.client, err, 'error');
		}
	};

	updateConfig = async (config: ClientConfig) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');

		if (mongo.ready) {
			this.client.config = config;

			await mongo.setConfig(config);
			this.client.ready = true;

			log(this.client, 'Client configured successfully.', 'info');
		} else
			queue.enqueue({
				func: this.updateConfig,
				args: [config]
			});
	};

	getKeyValue = async (
		channel: TextChannel,
		member: GuildMember,
		key: string,
		config: ClientConfig
	) => {
		const filter = (m: Message) => m.author.id === member.id;
		const awaitOptions = {
			max: 1,
			time: 60 * 1000,
			errors: ['time']
		};

		channel.send(key);
		config[key] = (
			await channel.awaitMessages(filter, awaitOptions)
		).first().content;
	};
}
