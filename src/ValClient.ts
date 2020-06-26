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

/**
 * @param { ClientOptions	} options DiscordClientOptions
 * @param { String } prefix The prefix used for all commands
 */

export default class ValClient extends Client {
	readonly prefix: string;
	ready: boolean;
	config: ClientConfig;
	commands: Map<string, Command>;
	controllers: Map<string, IController>;
	ValGuild: Guild;

	constructor(options: ClientOptions) {
		super(options);

		this.ready = false;
		this.prefix = MODE === 'DEVELOPMENT' ? 'vd!' : 'v!';
		this.controllers = new Map<string, IController>();
	}

	init = (token = AUTH_TOKEN) => {
		try {
			this.login(token);

			this.initLoaders();
			this.initConfig();
			this.initListeners();

			console.log(
				fs
					.readFileSync(path.resolve(__dirname, './media/bigtitle.txt'), 'utf8')
					.toString()
			);
		} catch (err) {
			log(
				this,
				`Something went wrong when initiating ValClient. Fix it and try again. Automatically retrying ${err.message}`,
				'error'
			);
		}
	};

	setPresence = () => {
		const presence: Presence = {
			message: `${this.prefix} help`,
			type: 'PLAYING'
		};

		log(this, `Current presence: ${presence.type} ${presence.message}`, 'info');

		if (this.user)
			this.user
				.setActivity(presence.message, { type: presence.type })
				.catch(err => log(this, err.message, 'error'));
	};

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	initLoaders = () => {
		log(this, 'Loaders loading', 'info');

		Object.values(loaders).forEach(loader => {
			new loader(this).load();
		});

		log(this, 'All loaders loaded successfully', 'info');
	};

	/**
	 * Initialises client listeners. Doesn't handle exceptions on purpose.
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
			const message = `Something went wrong when initialising ConfigController, ${err.message}`;

			log(this, message, 'error');
		}
	};
}
