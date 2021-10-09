import ValClient from "../ValClient";
import Controller from "../structures/Controller";

import { MongoClient, Db } from "mongodb";
import {
	Level,
	Milestone,
	Response,
	ClientConfig,
	Destroyable,
} from "../types/interfaces";
import { Snowflake } from "discord.js";

import { log } from "../utils/general";
import { RedisController, QueueController } from ".";

const { DB_HOST, DB_NAME } = process.env;

export default class MongoController extends Controller implements Destroyable {
	ready = false;
	mongo: MongoClient;
	db: Db;

	constructor(client: ValClient) {
		super(client, {
			name: "mongo",
		});

		this.mongo = new MongoClient(DB_HOST, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	}

	init = async () => {
		try {
			await this.mongo.connect();
			this.db = this.mongo.db(DB_NAME);

			if (typeof this.db !== "undefined") {
				this.ready = true;
				this.client.emit("queueExecute", "Mongo controller ready");
			}
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	destroy = () => {
		this.mongo.close(true);
	};

	syncLevels = async (id: Snowflake, levelToSync: Level) => {
		const { exp, text, voice, level, textXP, voiceXP } = levelToSync;

		await this.db.collection("levels").updateOne(
			{ id },
			{
				$set: { exp, text, voice, level, textXP, voiceXP },
			},
			{
				upsert: true,
			},
		);
	};

	getLevel = async (id: Snowflake): Promise<Level> => {
		return this.db.collection("levels").findOne({ id });
	};

	getLevels = async (): Promise<Level[]> => {
		return this.db.collection("levels").find({}).toArray();
	};

	getMilestones = async (): Promise<Milestone[]> => {
		return this.db.collection("milestones").find({}).toArray();
	};

	getResponses = async (): Promise<Response[]> => {
		return this.db.collection("responses").find({}).toArray();
	};

	/**
	 * Stores new responses, teaches bot
	 */
	saveResponse = async ({ invoker, reply }: Response) => {
		return this.db.collection("responses").updateOne(
			{
				invoker,
			},
			{
				$set: {
					invoker,
					reply,
				},
			},
			{
				upsert: true,
			},
		);
	};

	setConfig = async (config: ClientConfig) => {
		const redis = <RedisController>this.client.controllers.get("redis");
		const queue = <QueueController>this.client.controllers.get("queue");

		if (this.ready && redis.ready) {
			this.client.config = config;

			await this.db
				.collection("config")
				.findOneAndDelete({ GUILD_ID: process.env.GUIILD_ID });

			await this.db.collection("config").findOneAndReplace(
				{ GUILD_ID: process.env.GUILD_ID },
				{
					...config,
					GUILD_ID: String(process.env.GUILD_ID),
				},
				{ upsert: true },
			);
		} else {
			queue.enqueue({ func: this.setConfig, args: [config] });
		}
	};
}
