import Listener from "../structures/Listener";
import ValClient from "../ValClient";
import { CommandInteraction } from "discord.js";

import logger from "../utils/logging";
import Interaction from "../structures/Interaction";

export default class InteractionListener extends Listener {
	constructor(client: ValClient) {
		super(client, ["interactionCreate"]);
	}

	onInteractionCreate = async (interaction: CommandInteraction) => {
		try {
			const { commandName } = interaction;

			const command = this.client.commands.get(
				commandName.toLowerCase(),
			) as Interaction;

			await interaction.deferReply();

			command.run(interaction);
		} catch (error) {
			logger.error(error);
		}
	};
}
