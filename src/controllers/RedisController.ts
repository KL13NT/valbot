import Controller from "../structures/Controller";
import ValClient from "../ValClient";

import { promisify } from "util";

import redis, { RedisClient } from "redis";

import logger from "../utils/logging";
import { Destroyable } from "../types/interfaces";

export default class RedisController extends Controller implements Destroyable {
	ready = false;
	redis: RedisClient;

	getAsync: (key: string) => Promise<string>;
	setAsync: (key: string, value: string) => Promise<unknown>;
	incrAsync: (key: string) => Promise<number>;
	incrbyAsync: (key: string, increment: number) => Promise<number>;
	/** @returns {number} number of deleted keys */
	del: (key: string) => Promise<number>;
	/** @returns {number} number of deleted keys */
	expire: (key: string, seconds: number) => Promise<number>;

	constructor(client: ValClient) {
		super(client, {
			name: "redis",
		});
		this.ready = false;

		this.redis = redis.createClient(process.env.REDIS_URL);

		this.getAsync = promisify(this.redis.get).bind(this.redis);
		this.setAsync = promisify(this.redis.set).bind(this.redis);
		this.incrAsync = promisify(this.redis.incr).bind(this.redis);
		this.incrbyAsync = promisify(this.redis.incrby).bind(this.redis);
		this.del = promisify(this.redis.del).bind(this.redis);
		this.expire = promisify(this.redis.expire).bind(this.redis);
	}

	init = async () => {
		this.redis.on("ready", this.readyListener);
		this.redis.on("error", this.errorListener);
	};

	destroy = () => {
		this.redis.removeAllListeners();
		this.redis.end(false);
	};

	errorListener = (err: Error) => {
		logger.error(err);

		this.redis.removeAllListeners();
		this.ready = false;
	};

	readyListener = () => {
		logger.info("Redis ready");
		this.client.emit("queueExecute", "Redis controller ready");

		this.ready = true;

		this.redis.removeListener("ready", this.readyListener);
	};

	set = (key: string, value: string) => {
		return this.setAsync(key, value);
	};

	get = (key: string) => {
		return this.getAsync(key);
	};

	incr = (key: string) => {
		if (this.redis.exists(key)) return this.incrAsync(key);
		else throw Error("Key not found");
	};

	incrby = (key: string, by: number) => {
		if (this.redis.exists(key)) return this.incrbyAsync(key, by);
		else throw Error("Key not found");
	};
}
