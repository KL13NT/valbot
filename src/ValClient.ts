/* eslint-disable new-cap */
import { Client, Guild } from "discord.js";
import { ClientConfigValidator } from "./types/validators.joi";

import * as fs from "fs";
import * as path from "path";
import * as loaders from "./loaders";
import * as listeners from "./listeners";

import { log, transformObject } from "./utils/general";
import { ClientConfig, Presence } from "./types/interfaces";
import Command from "./structures/Command";
import {
	MongoController,
	QueueController,
	IntervalsController,
} from "./controllers";
import { Controller } from "./structures";

const { AUTH_TOKEN, MODE } = process.env;

export default class ValClient extends Client {
	readonly prefix = MODE === "DEVELOPMENT" ? "vd!" : "v!";
	ready = false;
	commands: Map<string, Command> = new Map<string, Command>();
	controllers: Map<string, Controller> = new Map<string, Controller>();
	ValGuild: Guild;
	config: ClientConfig = {
		AUTH_ADMIN: "",
		AUTH_MOD: "",
		AUTH_VERIFIED: "",
		AUTH_EVERYONE: "",
		CHANNEL_NOTIFICATIONS: "",
		CHANNEL_ANNOUNCEMENTS: "",
		CHANNEL_RULES: "",
		CHANNEL_POLLS: "",
		CHANNEL_TEST: "",
		CHANNEL_BOT_STATUS: "",
		CHANNEL_MOD_LOGS: "",
		CHANNEL_BOT_BUGS: "",
		ROLE_MUTED: "",
		ROLE_WARNED: "",
	};

	presences: Presence[] = [
		{
			status: "dnd",
			activity: {
				type: "WATCHING",
				name: "Sovereign writing bad code",
			},
			priority: false,
		},
		{
			status: "dnd",
			activity: {
				type: "WATCHING",
				name: "N1ffl3r making games",
			},
			priority: false,
		},
		{
			status: "dnd",
			activity: {
				type: "WATCHING",
				name: "Madara Omar disappearing",
			},
			priority: false,
		},
		{
			status: "dnd",
			activity: {
				type: "WATCHING",
				name: "Sovereign coding in SpaghettiScript",
			},
			priority: false,
		},
		{
			status: "dnd",
			activity: {
				name: `${this.prefix} help`,
				type: "PLAYING",
			},
			priority: false,
		},
	];

	init = async (token = AUTH_TOKEN) => {
		try {
			this.once("ready", this.onReady);

			await this.login(token);

			log(this, "Logged in", "info");

			console.log(
				fs
					.readFileSync(
						path.resolve(__dirname, "../media/bigtitle.txt"),
						"utf8",
					)
					.toString(),
			);
		} catch (err) {
			log(this, err, "error");
		}
	};

	onReady = async (): Promise<void> => {
		try {
			log(this, "Ready status received. Bot initialising.", "info");

			this.ValGuild = this.guilds.cache.first();

			await this.initLoaders();
			this.initListeners();
			await this.initConfig();

			const intervals = <IntervalsController>this.controllers.get("intervals");

			await this.setPresence();

			intervals.set({
				callback: this.setPresence,
				name: "presence",
				time: 30 * 1000,
			});

			this.emit("queueExecute", "Client ready");

			log(this, "Client ready", "info");
		} catch (error) {
			log(this, error, "error");
		}
	};

	setPresence = async () => {
		const presence = this.presences[
			Math.floor(Math.random() * this.presences.length)
		];
		const presenceWithPriority = this.presences.find(p => p.priority);

		if (this.user) {
			this.user
				.setPresence(presenceWithPriority || presence)
				.catch(err => log(this, err, "error"));
		} else {
			const queue = <QueueController>this.controllers.get("QueueController");

			queue.enqueue({
				args: [],
				func: this.setPresence,
			});
		}
	};

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	initLoaders = async () => {
		for (const loader of Object.values(loaders)) {
			await new loader(this).load();
		}

		log(this, "All loaders loaded successfully", "info");
	};

	/**
	 * Initialises client listeners.
	 * If it throws it means something is wrong with code, not behaviour.
	 */
	initListeners = () => {
		log(this, "Listeners loading", "info");

		Object.values(listeners).forEach(listener => {
			new listener(this).init();
		});

		log(this, "All listeners loaded successfully", "info");
	};

	initConfig = async () => {
		const mongo = <MongoController>this.controllers.get("mongo");
		const queue = <QueueController>this.controllers.get("queue");

		if (mongo.ready) {
			const response: ClientConfig = await mongo.db
				.collection("config")
				.findOne(
					{
						GUILD_ID: process.env.GUILD_ID,
					},
					{ projection: { _id: 0, GUILD_ID: 0 } },
				);

			if (!response || ClientConfigValidator.validate(response).error) {
				this.config = transformObject<ClientConfig>(response, this.config);
				await mongo.setConfig(this.config);
				console.log(ClientConfigValidator.validate(response).error);

				return log(
					this,
					`The bot is not setup. Commands won't work. Call ${this.prefix} setup`,
					"warn",
				);
			}

			const channelResolvers = Object.keys(response)
				.filter(key => key.includes("CHANNEL_"))
				.map(key => this.channels.fetch(response[key], true));

			await Promise.all(channelResolvers);

			this.ready = true;
			this.config = response;

			this.emit("queueExecute", "Config ready");
		} else {
			queue.enqueue({ func: this.initConfig, args: [] });
		}
	};
}
