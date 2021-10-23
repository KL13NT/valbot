import winston from "winston";
import consoleTransport from "../entities/transports/console";
import discordTransport from "../entities/transports/discord";
import sentryTransport from "../entities/transports/sentry";

const logger = winston.createLogger({
	exitOnError: false,
	level: process.env.MODE === "DEVELOPMENT" ? "debug" : "info",
	transports: [consoleTransport, sentryTransport, discordTransport],
});

export default logger;
