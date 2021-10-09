import ValClient from "./ValClient";

// failsafe
if (!process.env.MODE) {
	process.env.MODE = "DEVELOPMENT";
}

console.log(`[info] starting in ${process.env.MODE} mode`);

const client: ValClient = new ValClient({
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const kill = async () => {
	try {
		console.log("[kill] destroying client");
		client.destroy();

		console.log("[kill] destroying controllers");
		for (const controller of client.controllers.values()) {
			if (controller.destroy) await controller.destroy();
		}

		console.log("[kill] shutting down gracefully");
		process.exit(0);
	} catch (error) {
		console.log("[error] cleanup failed, exiting with status 1", error);
		process.exit(1);
	}
};

["SIGTERM", "SIGTERM", "SIGQUIT", "SIGHUP"].forEach(event =>
	process.on(event, kill),
);

client.on("error", (err: Error) => {
	console.log("An error occured with ValClient", err);
	kill();
});

(async () => {
	try {
		client.init(process.env.AUTH_TOKEN);
	} catch (error) {
		console.log("An error occured with ValClient", error);
		kill();
	}
})();
