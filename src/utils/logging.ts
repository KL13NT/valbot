import winston from "winston";
import { format } from "logform";

import consoleTransport from "../entities/transports/console";
import discordTransport from "../entities/transports/discord";
import sentryTransport from "../entities/transports/sentry";

const errorsFormat = format.errors({
	stack: process.env.MODE === "DEVELOPMENT",
});

const logger = winston.createLogger({
	exitOnError: false,
	level: process.env.MODE === "DEVELOPMENT" ? "debug" : "info",
	format: errorsFormat,
	transports: [consoleTransport, sentryTransport, discordTransport],
});

export default logger;
