import winston from "winston";
import consoleTransport from "../entities/transports/console";

const logger = winston.createLogger({
	exitOnError: false,
	transports: [consoleTransport],
});

export default logger;
