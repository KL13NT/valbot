import Controller from '../structures/Controller';
import ValClient from '../ValClient';

import { promisify } from 'util';

import redis, { RedisClient } from 'redis';

const { log } = require('../utils/general');

export default class RedisController extends Controller {
	ready: boolean = false;
	redis: RedisClient;

	constructor(client: ValClient) {
		super(client, {
			name: 'redis'
		});
		this.ready = false;

		this.redis = redis.createClient(process.env.REDIS_URL);

		this.redis.on('ready', this.readyListener);
		this.redis.on('error', this.errorListener);
	}

	private getAsync = promisify(this.redis.get).bind(this.redis);
	private setAsync = promisify(this.redis.set).bind(this.redis);
	private incrAsync = promisify(this.redis.incr).bind(this.redis);
	private incrbyAsync = promisify(this.redis.incrby).bind(this.redis);

	errorListener = (err: Error) => {
		const message = `Something went wrong when initialising Redis, ${err.message}, <@238009405176676352>`;

		log(this.client, message, 'error');
		this.redis.removeAllListeners();
		this.ready = false;
	};

	readyListener = () => {
		log(this.client, 'Redis controller ready', 'info');
		this.client.emit('queueExecute', 'Redis controller ready');

		this.ready = true;

		this.redis.removeListener('ready', this.readyListener);
	};

	set = (key: string, value: string) => {
		return this.setAsync(key, value);
	};

	get = (key: string) => {
		return this.getAsync(key);
	};

	incr = (key: string) => {
		if (this.redis.exists(key)) return this.incrAsync(key);
		else throw Error('Key not found');
	};

	incrby = (key: string, by: number) => {
		if (this.redis.exists(key)) return this.incrbyAsync(key, by);
		else throw Error('Key not found');
	};
}
