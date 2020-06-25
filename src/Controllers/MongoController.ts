const { DB_HOST, DB_NAME } = process.env;

import ValClient from '../ValClient';
import Controller from '../structures/Controller';

import { MongoClient, Db } from 'mongodb';
import { Level, Milestone, Response } from '../types/interfaces';
import { Snowflake } from 'discord.js';

const { log } = require('../utils/general');

export default class MongoController extends Controller {
	ready: boolean = false;
	mongo: MongoClient;
	db: Db;

	constructor(client: ValClient) {
		super(client, {
			name: 'mongo'
		});

		this.mongo = new MongoClient(DB_HOST, {
			useNewUrlParser: true
		});

		this.init();
	}

	init = async () => {
		try {
			await this.mongo.connect();
			this.db = this.mongo.db(DB_NAME);

			if (typeof this.db !== 'undefined') {
				this.ready = true;
				this.client.emit('queueExecute', 'Mongo controller ready');
			}
		} catch (err) {
			const message = `Something went wrong when initialising Mongo, ${err.message}, <@238009405176676352>`;

			log(this.client, message, 'error');
		}
	};

	syncLevels = async (id: Snowflake, levelToSync: Level) => {
		const { exp, text, voice, level, textXP, voiceXP } = levelToSync;

		await this.db.collection('levels').updateOne(
			{ id },
			{
				$set: { exp, text, voice, level, textXP, voiceXP }
			},
			{
				upsert: true
			}
		);
	};

	getLevel = async (id: Snowflake): Promise<Level> => {
		return this.db.collection('levels').findOne({ id });
	};

	getLevels = async (): Promise<Level[]> => {
		return this.db.collection('levels').find({}).toArray();
	};

	getMilestones = async (): Promise<Milestone[]> => {
		return this.db.collection('milestones').find({}).toArray();
	};

	getResponses = async (): Promise<Response[]> => {
		return this.db.collection('responses').find({}).toArray();
	};

	/**
	 * Stores new responses, teaches bot
	 */
	saveResponse = async ({ invoker, reply }: Response) => {
		return this.db.collection('responses').updateOne(
			{
				invoker
			},
			{
				$set: {
					invoker,
					reply
				}
			},
			{
				upsert: true
			}
		);
	};
}
