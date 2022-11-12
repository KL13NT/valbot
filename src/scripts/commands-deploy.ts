import * as commands from "../commands";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import ValClient from "../ValClient";
import Interaction from "../structures/Interaction";

const { CLIENT_ID, AUTH_TOKEN } = process.env;

const rest = new REST({ version: "10" }).setToken(AUTH_TOKEN);

const client = new ValClient({ intents: [] });

const slashCommands = Object.values(commands)
	// eslint-disable-next-line new-cap
	.map(command => new command(client))
	.filter(command => Object.hasOwn(command.options, "options"))
	.map(command => {
		const { options } = command as Interaction;

		return {
			name: options.name.toLowerCase(),
			description: options.description,
			options: options.options,
		};
	});

(async () => {
	try {
		console.log(
			`Started refreshing ${process.env.MODE} application (/) commands.`,
		);

		await rest.put(Routes.applicationCommands(CLIENT_ID), {
			body: slashCommands,
		});

		console.log("Successfully reloaded application (/) commands.");
		console.log(slashCommands.map(command => command.name).join("\n"));
	} catch (error) {
		console.error(error);
	}

	process.exit(0);
})();
