import Controller from "../structures/Controller";
import ValClient from "../ValClient";

import { promisify } from "util";

import redis, { RedisClient } from "redis";

import { log } from "../utils/general";

export default class RedisController extends Controller {
	ready = false;
	redis: RedisClient;

	getAsync: (key: string) => Promise<string>;
	setAsync: (key: string, value: string) => Promise<unknown>;
	incrAsync: (key: string) => Promise<number>;
	incrbyAsync: (key: string, increment: number) => Promise<number>;

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
	}

	init = async () => {
		this.redis.on("ready", this.readyListener);
		this.redis.on("error", this.errorListener);
	};

	errorListener = (err: Error) => {
		log(this.client, err, "error");

		this.redis.removeAllListeners();
		this.ready = false;
	};

	readyListener = () => {
		log(this.client, "Redis ready", "info");
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
