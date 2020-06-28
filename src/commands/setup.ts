import ValClient from '../ValClient';

import { Command, CommandContext } from '../structures';
import { Message, TextChannel, GuildMember } from 'discord.js';
import { ClientConfig } from '../types/interfaces';
import {
	MongoController,
	RedisController,
	QueueController
} from '../Controllers';

export default class Setup extends Command {
	constructor(client: ValClient) {
		super(client, {
			name: 'setup',
			category: 'Development',
			cooldown: 1000,
			nOfParams: 0,
			description: 'بتعمل setup للبوت. مينفعش تعمل cancel.',
			exampleUsage: '',
			extraParams: false,
			optionalParams: 0,
			auth: {
				method: 'ROLE',
				required: 'AUTH_DEV',
				devOnly: true
			}
		});
	}

	_run = async ({ channel, member, message }: CommandContext) => {
		const configTemplate = [
			'AUTH.AUTH_ADMIN',
			'AUTH.AUTH_MOD',
			'AUTH.AUTH_VERIFIED',
			'AUTH.AUTH_EVERYONE',

			'CHANNELS.CHANNEL_NOTIFICATIONS',
			'CHANNELS.CHANNEL_RULES',
			'CHANNELS.CHANNEL_POLLS',
			'CHANNELS.CHANNEL_TEST',
			'CHANNELS.CHANNEL_BOT_STATUS',
			'CHANNELS.CHANNEL_MOD_LOGS',

			'ROLES.ROLE_MUTED',
			'ROLES.ROLE_WARNED'
		];

		const config = {};

		await message.reply('starting config setup. This is irreversible.');

		const questions = configTemplate.map(variable =>
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

		message.reply('Saving config');

		// this.setConfig(config); //TODO: uncomment
		this.client.ready = true;
	};

	//TODO: fix this
	getKeyValue = async (
		channel: TextChannel,
		member: GuildMember,
		path: string,
		config: { [index: string]: { [index: string]: Message } }
	) => {
		const filter = (m: Message) => m.author.id === member.id;
		const awaitOptions = {
			max: 1,
			time: 60 * 1000,
			errors: ['time']
		};

		const collection = path.split('.')[0];
		const value = path.split('.')[1];

		if (!config[collection]) config[collection] = {};

		channel.send(path);
		config[collection][value] = (
			await channel.awaitMessages(filter, awaitOptions)
		).first();
	};

	async setConfig(config: ClientConfig) {
		const mongo = <MongoController>this.client.controllers.get('mongo');
		const redis = <RedisController>this.client.controllers.get('redis');
		const queue = <QueueController>this.client.controllers.get('queue');

		if (mongo.ready && redis.ready) {
			this.client.config = config;

			mongo.db.collection('config').updateOne(
				{ GUILD_ID: String(process.env.GUILD_ID) },
				{
					$set: {
						...config,
						GUILD_ID: String(process.env.GUILD_ID)
					}
				},
				{ upsert: true }
			);
		} else {
			queue.enqueue({ func: this.setConfig, args: [config] });
		}
	}
}
