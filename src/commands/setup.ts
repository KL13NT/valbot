import ValClient from '../ValClient';

import { ClientConfig } from '../types/interfaces';
import { Command, CommandContext } from '../structures';
import { Message, TextChannel, GuildMember } from 'discord.js';
import { MongoController, QueueController } from '../Controllers';

import { log } from '../utils/general';

export default class Setup extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'setup',
			category: 'Development',
			cooldown: 1000,
			nOfParams: 2,
			description: 'بتعمل setup للبوت. مينفعش تعمل cancel.',
			exampleUsage: 'get\nget AUTH_ADMIN\nset\nset AUTH_ADMIN',
			extraParams: false,
			optionalParams: 1,
			auth: {
				method: 'ROLE',
				required: 'AUTH_DEV',
				devOnly: true
			}
		});
	}

	_run = async (context: CommandContext) => {
		const { channel, member, message, params } = context;
		const config = this.client.config;

		const op = params[0];
		const variable = params[1];

		const filter = (m: Message) => m.author.id === member.id;
		const awaitOptions = {
			max: 1,
			time: 60 * 1000,
			errors: ['time']
		};

		try {
			if (op !== 'get' && op !== 'set') {
				await message.reply('لازم تحدد `set` ولا `get`');
				return;
			}

			if (params.length === 2 && !variable) {
				await message.reply('مش موجود');
				return;
			}

			if (params.length === 2 && op === 'get') {
				const value = config[variable];

				await message.reply(`${variable} = ${value}`);
				return;
			}

			if (params.length === 2 && op === 'set') {
				await message.reply('ايه القيمة؟');

				const value = (
					await channel.awaitMessages(filter, awaitOptions)
				).first().content;

				config[variable] = value;

				await this.updateConfig(config);
				await message.reply(`تم.\n\`${variable}\` = \`${value}\``);
				return;
			}

			if (op === 'get') {
				const values = Object.keys(config).map(key => {
					return `\`${key}\` = \`${config[key]}\``;
				});

				await message.reply(values.join('\n'));
				return;
			}

			await message.reply('starting config setup. This is irreversible.');

			const questions = Object.keys(config).map(variable =>
				this.getKeyValue.bind(
					null,
					<TextChannel>channel,
					member,
					variable,
					config
				)
			);

			for (const question of questions) {
				await question();
			}

			await message.reply('Saving config');

			await this.updateConfig(config);
			this.client.ready = true;
		} catch (err) {
			log(this.client, err, 'error');
		}
	};

	updateConfig = async (config: ClientConfig) => {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const queue = <QueueController>this.client.controllers.get('queue');

		if (mongo.ready) {
			await mongo.setConfig(config);
			return;
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
