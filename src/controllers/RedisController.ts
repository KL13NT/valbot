import Controller from "../structures/Controller";
import ValClient from "../ValClient";

import { createClient } from "redis";

import logger from "../utils/logging";
import { Destroyable } from "../types/interfaces";

type RedisClient = ReturnType<typeof createClient>;

export default class RedisController extends Controller implements Destroyable {
	ready = false;
	redis: RedisClient;

	get: RedisClient["get"];
	set: RedisClient["set"];
	del: RedisClient["del"];
	expire: RedisClient["expire"];

	constructor(client: ValClient) {
		super(client, {
			name: "redis",
		});
		this.ready = false;

		this.redis = createClient({
			url: process.env.REDIS_URL,
		});

		this.get = this.redis.get.bind(this.redis);
		this.set = this.redis.set.bind(this.redis);
		this.del = this.redis.del.bind(this.redis);
		this.expire = this.redis.expire.bind(this.redis);
	}

	init = async () => {
		await this.redis.connect();
		this.ready = true;

		this.redis.on("ready", this.readyListener);
		this.redis.on("error", this.errorListener);
	};

	destroy = async () => {
		this.redis.removeAllListeners();
		await this.redis.disconnect();
	};

	errorListener = (err: Error) => {
		logger.error(err.message);

		this.redis.removeAllListeners();
		this.ready = false;
	};

	readyListener = () => {
		logger.info("Redis ready");
		this.client.emit("queueExecute", "Redis controller ready");

		this.ready = true;

		this.redis.removeListener("ready", this.readyListener);
	};

	incr = async (key: string) => {
		if (this.redis.exists(key)) return this.redis.incr(key);
		else throw Error("Key not found");
	};

	incrby = async (key: string, by: number) => {
		if (this.redis.exists(key)) return this.redis.incrBy(key, by);
		else throw Error("Key not found");
	};
}
