const { AUTH_TOKEN, MODE } = process.env;

import { Client, ClientOptions, Guild } from 'discord.js';

import * as fs from 'fs';
import * as path from 'path';
import * as loaders from './loaders';
import * as listeners from './listeners';

import { log } from './utils/general';
import { ClientConfig, IController } from './types/interfaces';
import { Presence } from './types/interfaces';
import Command from './structures/Command';
import {
	MongoController,
	RedisController,
	QueueController
} from './controllers';

export default class ValClient extends Client {
	readonly prefix: string;
	ready: boolean;
	config: ClientConfig;
	commands: Map<string, Command> = new Map<string, Command>();
	controllers: Map<string, IController> = new Map<string, IController>();
	ValGuild: Guild;

	constructor(options: ClientOptions) {
		super(options);

		this.ready = false;
		this.prefix = MODE === 'DEVELOPMENT' ? 'vd!' : 'v!';
		this.controllers = new Map<string, IController>();
	}

	init = async (token = AUTH_TOKEN) => {
		try {
			this.login(token);

			this.on('ready', this.onReady);

			console.log(
				fs
					.readFileSync(
						path.resolve(__dirname, '../media/bigtitle.txt'),
						'utf8'
					)
					.toString()
			);
		} catch (err) {
			log(this, err, 'error');
		}
	};

	onReady = async (): Promise<void> => {
		this.setPresence();

		this.ValGuild = this.guilds.cache.first();

		this.initLoaders();
		this.initListeners();
		await this.initConfig();

		this.emit('queueExecute', 'Client ready');

		log(this, 'Client ready', 'info');
	};

	setPresence = () => {
		const presence: Presence = {
			message: `${this.prefix} help`,
			type: 'PLAYING'
		};

		if (this.user)
			this.user
				.setActivity(presence.message, { type: presence.type })
				.catch(err => log(this, err.message, 'error'));
	};

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	initLoaders = () => {
		Object.values(loaders).forEach(loader => {
			new loader(this).load();
		});

		log(this, 'All loaders loaded successfully', 'info');
	};

	/**
	 * Initialises client listeners.
	 * If it throws it means something is wrong with code, not behaviour.
	 */
	initListeners = () => {
		log(this, 'Listeners loading', 'info');

		Object.values(listeners).forEach(listener => {
			new listener(this).init();
		});

		log(this, 'All listeners loaded successfully', 'info');
	};

	initConfig = async () => {
		try {
			const mongo = <MongoController>this.controllers.get('mongo');
			const redis = <RedisController>this.controllers.get('redis');
			const queue = <QueueController>this.controllers.get('queue');

			if (mongo.ready && redis.ready) {
				const response: ClientConfig = await mongo.db
					.collection('config')
					.findOne({
						GUILD_ID: process.env.GUILD_ID
					});

				if (!response)
					return log(
						this,
						`The bot is not setup. Commands won't work. Call ${this.prefix} setup`,
						'warn'
					);

				this.ready = true;
				this.config = response;
			} else {
				queue.enqueue({ func: this.initConfig, args: [] });
			}
		} catch (err) {
			log(this, err, 'error');
		}
	};
}
