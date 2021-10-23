import Sentry from "winston-transport-sentry-node";

const sentryTransport = new Sentry({
	sentry: {
		dsn: process.env.SENTRY_DSN,
	},
	silent: process.env.MODE === "DEVELOPMENT",
	level: "error",
});

export default sentryTransport;
