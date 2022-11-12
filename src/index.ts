import ValClient from "./ValClient";
import logger from "./utils/logging";

// failsafe
if (!process.env.MODE) {
	logger.warn("No env mode found, setting to default");
	process.env.MODE = "DEVELOPMENT";
}

logger.info(`starting in ${process.env.MODE} mode`);

const client: ValClient = new ValClient({
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
	intents: [
		"DIRECT_MESSAGES",
		"MESSAGE_CONTENT",
		"GUILDS",
		"GUILD_BANS",
		"GUILD_VOICE_STATES",
	],
});

const kill = async () => {
	try {
		logger.warn("[kill] destroying client");
		client.destroy();

		logger.warn("[kill] destroying controllers");
		for (const controller of client.controllers.values()) {
			if (controller.destroy) await controller.destroy();
		}

		logger.warn("[kill] shutting down gracefully");
		process.exit(0);
	} catch (error) {
		logger.warn("[error] cleanup failed, exiting with status 1", error);
		process.exit(1);
	}
};

["SIGTERM", "SIGTERM", "SIGQUIT", "SIGHUP"].forEach(event =>
	process.on(event, kill),
);

client.on("error", (err: Error) => {
	logger.warn("An error occurred with ValClient", err);
	kill();
});

(async () => {
	try {
		client.init(process.env.AUTH_TOKEN);
	} catch (error) {
		logger.warn("An error occurred with ValClient", error);
		kill();
	}
})();
