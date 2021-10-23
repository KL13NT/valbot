import winston, { format } from "winston";

const logFormat = format.printf(
	info =>
		`${process.env.MODE === "PRODUCTION" ? "" : info.timestamp} [${
			info.level
		}] ${info.message}`,
);

const consoleTransport = new winston.transports.Console({
	level: process.env.MODE === "PRODUCTION" ? "info" : "debug",
	stderrLevels: ["error"],
	consoleWarnLevels: ["warn"],
	format: format.combine(
		format.errors({ stack: true }),
		format.timestamp(),
		format.prettyPrint(),
		format.colorize(),
		logFormat,
	),
});

export default consoleTransport;
