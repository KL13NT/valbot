/* eslint-disable new-cap */
import { Client, Guild } from "discord.js";
import { ClientConfigValidator } from "./types/validators.joi";

import * as loaders from "./loaders";
import * as listeners from "./listeners";

import logger from "./utils/logging";
import { transformObject } from "./utils/general";
import { ClientConfig } from "./types/interfaces";
import Command from "./structures/Command";
import { MongoController } from "./controllers";
import { Controller } from "./structures";
import Interaction from "./structures/Interaction";

const { AUTH_TOKEN, MODE } = process.env;

export default class ValClient extends Client {
	readonly prefix = MODE === "DEVELOPMENT" ? "!" : "-";
	ready = false;
	commands: Map<string, Command | Interaction> = new Map<string, Command>();
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

	init = async (token = AUTH_TOKEN) => {
		this.once("ready", this.onReady);

		logger.info("Logging in");

		await this.login(token);
	};

	onReady = async (): Promise<void> => {
		try {
			logger.info("Ready status received. Bot initialising.");

			this.ValGuild = this.guilds.cache.first();

			await this.initLoaders();
			this.initListeners();
			await this.initConfig();

			logger.info("Client ready");
		} catch (error) {
			logger.error(error);
		}
	};

	/**
	 * Initialises client loaders. Doesn't handle exceptions on purpose.
	 */
	initLoaders = async () => {
		for (const loader of Object.values(loaders)) {
			await new loader(this).load();
		}

		logger.info("All loaders loaded successfully");
	};

	/**
	 * Initialises client listeners.
	 * If it throws it means something is wrong with code, not behaviour.
	 */
	initListeners = () => {
		logger.info("Listeners loading");

		Object.values(listeners).forEach(listener => {
			new listener(this).init();
		});

		logger.info("All listeners loaded successfully");
	};

	initConfig = async () => {
		const mongo = <MongoController>this.controllers.get("mongo");

		const response: ClientConfig = await mongo.db.collection("config").findOne(
			{
				GUILD_ID: process.env.GUILD_ID,
			},
			{ projection: { _id: 0, GUILD_ID: 0 } },
		);

		if (!response || ClientConfigValidator.validate(response).error) {
			this.config = transformObject<ClientConfig>(response, this.config);
			await mongo.setConfig(this.config);

			return logger.warn(
				`The bot is not setup. Commands won't work. Call ${this.prefix} setup`,
			);
		}

		const channelResolvers = Object.keys(response)
			.filter(key => key.includes("CHANNEL_"))
			.map(key => this.channels.fetch(response[key], { cache: true }));

		await Promise.all(channelResolvers);

		this.ready = true;
		this.config = response;
	};
}
